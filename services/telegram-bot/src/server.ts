/**
 * Musikschule CMS Bielefeld — Telegram Admin Bot
 *
 * HTTPS server on port 8443 (Telegram-supported).
 * Uses the same Let's Encrypt certs as the main nginx site.
 *
 * Flow overview:
 *   text message   → history-aware AGY call → chat reply OR diff+confirm
 *   voice message  → AssemblyAI transcription → show transcript → same as text
 *   photo/document → validate → WebP asset → AGY content reference → confirm/deploy
 *   /command       → instant handler (no AGY)
 *   callback_query → confirm (deploy) or cancel (rollback)
 */
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { IncomingMessage, ServerResponse } from 'node:http';
import { config } from './config.ts';
import * as bot from './bot.ts';
import { buildPrompt, runAgy, extractChatResponse } from './agy.ts';
import {
  getDiff,
  hasDisallowedFilesChanged,
  onlyAllowedFilesChanged,
  isWorkspaceReadyForAgent,
  rollback,
  commitAndRebuild,
  getRecentLog,
} from './deploy.ts';
import { transcribeAudio } from './transcribe.ts';
import { addMessage, getHistory, clearHistory } from './history.ts';
import { authorizeFromContact, isUserAuthorized } from './auth.ts';
import {
  activateWebsiteImage,
  cleanupPreparedImages,
  discardPreparedImage,
  prepareWebsiteImage,
} from './media.ts';
import type { PreparedWebsiteImage } from './media.ts';
import type { TelegramDocument, TelegramUpdate, PendingChange } from './types.ts';

// ── State ─────────────────────────────────────────────────────────────────────

const processedIds = new Set<number>();
let isBusy = false;
const pendingChanges = new Map<number, PendingChange>();
const pendingImages = new Map<number, { image: PreparedWebsiteImage; timeoutHandle: NodeJS.Timeout }>();
const PENDING_IMAGE_TIMEOUT_MS = 10 * 60 * 1000;

// ── HTTPS Server ──────────────────────────────────────────────────────────────

function startServer(): void {
  let sslOptions: { cert: Buffer; key: Buffer };
  try {
    sslOptions = {
      cert: readFileSync(config.sslCert),
      key: readFileSync(config.sslKey),
    };
  } catch (err) {
    console.error('[server] Cannot read SSL certificates:', err);
    console.error('[server] cert:', config.sslCert);
    console.error('[server] key: ', config.sslKey);
    process.exit(1);
  }

  const server = https.createServer(sslOptions, handleRequest);

  server.listen(config.port, config.host, () => {
    console.log(`[server] Listening on https://${config.host}:${config.port}`);
    console.log(`[server] Allowed users: ${config.allowedUsers.join(', ') || 'NONE — check TELEGRAM_ALLOWED_USERS!'}`);
    console.log(`[server] Allowed phone self-auth entries: ${config.allowedPhones.length}`);
    console.log(`[server] AssemblyAI: ${config.assemblyAiKey ? 'configured ✓' : 'not set (voice disabled)'}`);
    void bot.setWebhook(config.webhookUrl).catch((err) => {
      console.error('[server] Failed to register Telegram webhook:', err);
    });
  });

  for (const sig of ['SIGTERM', 'SIGINT'] as const) {
    process.on(sig, () => {
      console.log(`[server] ${sig} received, shutting down…`);
      server.close(() => process.exit(0));
    });
  }
}

// ── Request router ────────────────────────────────────────────────────────────

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, uptime: process.uptime() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/telegram/webhook') {
    handleWebhook(req, res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

// ── Webhook handler ───────────────────────────────────────────────────────────

function handleWebhook(req: IncomingMessage, res: ServerResponse): void {
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== config.webhookSecret) {
    console.warn('[webhook] Rejected request with invalid secret token');
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false }));
    return;
  }

  let body = '';
  req.on('data', (chunk: Buffer) => (body += chunk.toString()));
  req.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    parseAndProcess(body).catch((err) => {
      console.error('[webhook] Unhandled error:', err);
    });
  });
}

async function parseAndProcess(rawBody: string): Promise<void> {
  let update: TelegramUpdate;
  try {
    update = JSON.parse(rawBody) as TelegramUpdate;
  } catch {
    console.error('[webhook] Failed to parse update JSON');
    return;
  }

  console.log(`[webhook] Accepted update ${update.update_id}`);

  if (processedIds.has(update.update_id)) return;
  processedIds.add(update.update_id);
  if (processedIds.size > 1000) {
    const first = processedIds.values().next().value!;
    processedIds.delete(first);
  }

  const msg = update.message;
  if (msg) {
    const chatId = msg.chat.id;

    if (!(await ensureAuthorizedMessage(msg))) {
      return;
    }

    if (msg.contact) {
      await bot.sendMessage(chatId, '✅ Zugang ist bereits aktiv. Schreib mir einfach, was ich an der Website ändern soll.', {
        remove_keyboard: true,
      });
    } else if (msg.text?.startsWith('/')) {
      await handleCommand(msg.text, chatId);
    } else if (msg.voice || msg.audio) {
      await handleVoice(chatId, msg.voice?.file_id ?? msg.audio!.file_id, msg.voice?.mime_type ?? msg.audio?.mime_type);
    } else if (msg.photo) {
      const caption = msg.caption?.trim() ?? '';
      await handlePhoto(chatId, msg.photo, caption);
    } else if (msg.document) {
      const caption = msg.caption?.trim() ?? '';
      await handleImageDocument(chatId, msg.document, caption);
    } else if (msg.text) {
      const pendingImage = takePendingImage(chatId);
      await processRequest(chatId, msg.text.trim(), pendingImage);
    }
  } else if (update.callback_query) {
    await handleCallback(update);
  }
}

async function ensureAuthorizedMessage(msg: NonNullable<TelegramUpdate['message']>): Promise<boolean> {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) {
    await bot.sendContactAuthPrompt(chatId);
    return false;
  }

  if (isUserAuthorized(userId)) return true;

  if (msg.contact) {
    const result = authorizeFromContact(userId, msg.contact);
    if (result.ok) {
      console.log(`[auth] User ${userId} authorized through allowed phone contact`);
      await bot.sendMessage(
        chatId,
        '✅ Zugang freigeschaltet. Schreib mir jetzt einfach, was ich an der Website ändern soll.',
        { remove_keyboard: true },
      );
      return false;
    }

    console.log(`[auth] Contact auth rejected for user ${userId}: ${result.reason}`);
    const reason =
      result.reason === 'contact_not_self'
        ? 'Bitte teile deinen eigenen Telegram-Kontakt über den Button, nicht einen gespeicherten Kontakt.'
        : 'Diese Telefonnummer ist nicht für den Website-Bot freigeschaltet.';
    await bot.sendMessage(chatId, `🚫 Zugang verweigert.\n\n${reason}`, { remove_keyboard: true });
    return false;
  }

  console.log(`[webhook] Unauthorized user ${userId}`);
  await bot.sendContactAuthPrompt(chatId, userId);
  return false;
}

// ── Command handler ───────────────────────────────────────────────────────────

async function handleCommand(text: string, chatId: number): Promise<void> {
  const [cmd] = text.split(/\s+/);

  switch (cmd) {
    case '/start':
      await bot.sendMessage(
        chatId,
        `👋 <b>Musikschule Admin Bot</b>\n\n` +
          `Ich bin dein KI-Assistent für die Website-Verwaltung.\n\n` +
          `<b>Was ich kann:</b>\n` +
          `• Fragen zur Website beantworten\n` +
          `• Texte, Preise, Kontaktdaten ändern\n` +
          `• Sprachnachrichten verstehen (transkribiere und verarbeite sie)\n` +
          `• Bilder veröffentlichen oder ersetzen (Foto + Beschreibung)\n` +
          `• Screenshots analysieren\n\n` +
          `<b>Befehle:</b>\n` +
          `/help — diese Hilfe\n` +
          `/status — letzte Änderungen an der Website\n` +
          `/clear — Gesprächsverlauf löschen\n` +
          `/rollback — letzte Änderung rückgängig machen\n\n` +
          `Schreib einfach los — auf Russisch, Deutsch oder Englisch.`,
      );
      break;

    case '/help':
      await bot.sendMessage(
        chatId,
        `<b>Wie ich funktioniere:</b>\n\n` +
          `1. Schick mir eine Nachricht (Text, Sprache oder Bild)\n` +
          `2. Ich analysiere sie und antworte oder bereite eine Änderung vor\n` +
          `3. Bei Änderungen siehst du eine Vorschau (diff) und bestätigst\n` +
          `4. Die Website wird automatisch neu gebaut (~2-4 Min)\n\n` +
          `<b>Beispiele:</b>\n` +
          `• "Какой сейчас номер телефона?" → ответ из content.js\n` +
          `• "Измени телефон на 0521-123456" → покажу diff\n` +
          `• 🎤 Голосовое: "Добавь новость про летний концерт" → транскрибирую и выполню\n` +
          `• 📷 Foto + "Setze dieses Bild auf Aktuelles" → bereite Bild und Änderung zur Bestätigung vor\n` +
          `• 📷 Скриншот + "Измени вот этот заголовок" → пойму контекст и изменю`,
      );
      break;

    case '/status': {
      try {
        const log = getRecentLog(5);
        await bot.sendMessage(chatId, `📋 <b>Letzte Änderungen:</b>\n\n<pre>${escapeHtml(log)}</pre>`);
      } catch {
        await bot.sendMessage(chatId, '❌ Konnte den Git-Log nicht lesen.');
      }
      break;
    }

    case '/clear':
      clearHistory(chatId);
      discardPendingImage(chatId);
      await bot.sendMessage(chatId, '🧹 Gesprächsverlauf gelöscht.');
      break;

    case '/rollback': {
      if (isBusy) {
        await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
        return;
      }
      try {
        const pending = pendingChanges.get(chatId);
        if (pending) {
          clearTimeout(pending.timeoutHandle);
          pendingChanges.delete(chatId);
        }
        rollback(pending?.assetPaths);
        discardPendingImage(chatId);
        await bot.sendMessage(chatId, '↩️ Alle nicht übernommenen Änderungen wurden verworfen.');
      } catch {
        await bot.sendMessage(chatId, '❌ Rollback fehlgeschlagen. Prüfe die Server-Logs.');
      }
      break;
    }

    default:
      await bot.sendMessage(chatId, `❓ Unbekannter Befehl: <code>${escapeHtml(cmd)}</code>\nTipp: /help`);
  }
}

// ── Voice handler ─────────────────────────────────────────────────────────────

async function handleVoice(chatId: number, fileId: string, mimeType?: string): Promise<void> {
  if (!config.assemblyAiKey) {
    await bot.sendMessage(
      chatId,
      '🎤 Sprachnachrichten sind nicht aktiviert.\n' +
        'Setze <code>ASSEMBLYAI_API_KEY</code> in der .env-Datei.',
    );
    return;
  }

  if (isBusy) {
    await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
    return;
  }

  try {
    await bot.sendRecordingTyping(chatId);

    // Download voice file from Telegram
    const fileInfo = await bot.getFile(fileId);
    const audioBuffer = await bot.downloadFile(fileInfo.file_path);

    // Determine extension: Telegram voice = .oga (OGG Opus)
    const ext = extname(fileInfo.file_path).replace('.', '') || (mimeType?.includes('mp4') ? 'mp4' : 'oga');

    await bot.sendTyping(chatId);
    const transcript = await transcribeAudio(audioBuffer, ext);

    if (!transcript.trim()) {
      await bot.sendMessage(chatId, '🎤 Konnte die Sprachnachricht nicht transkribieren. Bitte versuche es erneut.');
      return;
    }

    // Show transcript so user can verify
    await bot.sendMessage(chatId, `🎤 <i>Transkription:</i> "${escapeHtml(transcript)}"`);

    // Process as regular text
    await processRequest(chatId, transcript);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[voice] Error:', errMsg);
    await bot.sendMessage(
      chatId,
      `❌ Fehler bei der Sprachverarbeitung:\n<pre>${escapeHtml(errMsg.slice(0, 200))}</pre>`,
    );
  }
}

// ── Photo handler ─────────────────────────────────────────────────────────────

async function handlePhoto(
  chatId: number,
  photos: NonNullable<import('./types.ts').TelegramMessage['photo']>,
  caption: string,
): Promise<void> {
  if (isBusy) {
    await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
    return;
  }

  try {
    await bot.sendTyping(chatId);

    // Download the largest photo size
    const largest = photos.reduce((a, b) => (a.file_size ?? 0) > (b.file_size ?? 0) ? a : b);
    if ((largest.file_size ?? 0) > 15 * 1024 * 1024) {
      await bot.sendMessage(chatId, '❌ Das Bild ist größer als 15 MB. Bitte sende eine kleinere Datei.');
      return;
    }
    const image = await downloadAndPrepareImage(largest.file_id, largest.file_unique_id);
    await handlePreparedImage(chatId, image, caption);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[photo] Error:', errMsg);
    await bot.sendMessage(
      chatId,
      `❌ Fehler bei der Bildverarbeitung:\n<pre>${escapeHtml(errMsg.slice(0, 200))}</pre>`,
    );
  }
}

async function handleImageDocument(
  chatId: number,
  document: TelegramDocument,
  caption: string,
): Promise<void> {
  if (!document.mime_type?.startsWith('image/')) {
    await bot.sendMessage(chatId, '❌ Bitte sende das Bild als Foto oder als JPEG-, PNG- bzw. WebP-Datei.');
    return;
  }
  if ((document.file_size ?? 0) > 15 * 1024 * 1024) {
    await bot.sendMessage(chatId, '❌ Das Bild ist größer als 15 MB. Bitte sende eine kleinere Datei.');
    return;
  }
  if (isBusy) {
    await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
    return;
  }

  try {
    await bot.sendTyping(chatId);
    const image = await downloadAndPrepareImage(document.file_id, document.file_unique_id);
    await handlePreparedImage(chatId, image, caption);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[document-image] Error:', errMsg);
    await bot.sendMessage(chatId, `❌ Fehler bei der Bildverarbeitung:\n<pre>${escapeHtml(errMsg.slice(0, 200))}</pre>`);
  }
}

async function downloadAndPrepareImage(fileId: string, uniqueId: string): Promise<PreparedWebsiteImage> {
  const fileInfo = await bot.getFile(fileId);
  const imageBuffer = await bot.downloadFile(fileInfo.file_path);
  return prepareWebsiteImage(imageBuffer, uniqueId);
}

async function handlePreparedImage(
  chatId: number,
  image: PreparedWebsiteImage,
  caption: string,
): Promise<void> {
  if (caption) {
    await processRequest(chatId, caption, image);
    return;
  }

  discardPendingImage(chatId);
  const timeoutHandle = setTimeout(async () => {
    pendingImages.delete(chatId);
    discardPreparedImage(image);
    await bot.sendMessage(chatId, '⏰ Das Bild wurde verworfen, weil keine Beschreibung gesendet wurde.');
  }, PENDING_IMAGE_TIMEOUT_MS);
  pendingImages.set(chatId, { image, timeoutHandle });
  await bot.sendMessage(
    chatId,
    '📷 Bild vorbereitet. Schreib mir jetzt innerhalb von 10 Minuten, wo es erscheinen oder welches Bild es ersetzen soll.',
  );
}

function takePendingImage(chatId: number): PreparedWebsiteImage | undefined {
  const pending = pendingImages.get(chatId);
  if (!pending) return undefined;
  clearTimeout(pending.timeoutHandle);
  pendingImages.delete(chatId);
  return pending.image;
}

function discardPendingImage(chatId: number): void {
  const pending = pendingImages.get(chatId);
  if (!pending) return;
  clearTimeout(pending.timeoutHandle);
  pendingImages.delete(chatId);
  discardPreparedImage(pending.image);
}

// ── Core request processor ────────────────────────────────────────────────────

/**
 * Shared processing pipeline for text, voice transcript, and photo+caption.
 * Runs AGY → if diff found: show for confirmation; otherwise: show chat reply.
 */
async function processRequest(
  chatId: number,
  userText: string,
  image?: PreparedWebsiteImage,
): Promise<void> {
  if (isBusy) {
    if (image) discardPreparedImage(image);
    await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
    return;
  }

  // A new request replaces any previous unconfirmed change for this chat.
  const existing = pendingChanges.get(chatId);
  if (existing) {
    clearTimeout(existing.timeoutHandle);
    rollback(existing.assetPaths);
    pendingChanges.delete(chatId);
  }

  let websiteImage: PreparedWebsiteImage | undefined;
  try {
    websiteImage = image ? activateWebsiteImage(image) : undefined;
  } catch (err) {
    if (image) discardPreparedImage(image);
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[media] Failed to activate prepared image:', errMsg);
    await bot.sendMessage(chatId, `❌ Bild konnte nicht vorbereitet werden:\n<pre>${escapeHtml(errMsg.slice(0, 200))}</pre>`);
    return;
  }

  const expectedWorkspaceChanges = websiteImage ? [websiteImage.repoRelativePath] : [];
  if (!isWorkspaceReadyForAgent(expectedWorkspaceChanges)) {
    if (websiteImage) cleanupPreparedImages(expectedWorkspaceChanges);
    console.error('[processRequest] Refusing AGY run because the repository is not clean');
    await bot.sendMessage(
      chatId,
      '⚠️ Der Website-Arbeitsbereich enthält bereits eine andere Änderung. Bitte versuche es später erneut.',
    );
    return;
  }

  // Add user message to history
  addMessage(chatId, 'user', userText);

  isBusy = true;

  try {
    await bot.sendTyping(chatId);

    const history = getHistory(chatId);
    const prompt = buildPrompt(userText, history, websiteImage?.absolutePath, websiteImage?.publicUrl);
    const agentResult = await runAgy(prompt);

    if (!agentResult.success) {
      await bot.sendMessage(chatId, formatAgyFailure(agentResult.stderr));
      rollback(websiteImage ? [websiteImage.repoRelativePath] : []);
      return;
    }

    const chatResponse = extractChatResponse(agentResult.stdout);
    if (hasDisallowedFilesChanged()) {
      await bot.sendMessage(
        chatId,
        '⚠️ Der KI-Agent hat versucht, andere Dateien zu ändern. Die Änderungen wurden verworfen.',
      );
      rollback(websiteImage ? [websiteImage.repoRelativePath] : []);
      return;
    }

    const diff = getDiff();

    // ── Path A: AGY made a content change → show diff for confirmation ───────
    if (diff) {
      if (!onlyAllowedFilesChanged()) {
        await bot.sendMessage(
          chatId,
          '⚠️ Der KI-Agent hat versucht, andere Dateien zu ändern. Die Änderungen wurden verworfen.',
        );
        rollback(websiteImage ? [websiteImage.repoRelativePath] : []);
        return;
      }

      const previewMsgId = await bot.sendDiffPreview(chatId, diff, chatResponse || undefined);

      const timeoutHandle = setTimeout(async () => {
        pendingChanges.delete(chatId);
        rollback(websiteImage ? [websiteImage.repoRelativePath] : []);
        await bot.editMessage(chatId, previewMsgId, '⏰ Zeit abgelaufen. Die Änderung wurde verworfen.');
      }, config.confirmTimeoutMs);

      pendingChanges.set(chatId, {
        chatId,
        previewMessageId: previewMsgId,
        diff,
        timeoutHandle,
        userMessage: userText,
        assetPaths: websiteImage ? [websiteImage.repoRelativePath] : [],
      });

      // Store assistant's response in history
      addMessage(chatId, 'assistant', chatResponse || 'Änderung vorbereitet. Bitte bestätigen.');

    // ── Path B: AGY just chatted → show its text reply ───────────────────────
    } else {
      if (websiteImage) {
        cleanupPreparedImages([websiteImage.repoRelativePath]);
        console.error('[processRequest] AGY returned success without publishing the prepared image');
        const reply =
          '⚠️ <b>Das Bild wurde nicht veröffentlicht.</b>\n\n' +
          'Der KI-Agent hat keine Änderung an der Website erzeugt. Bitte sende das Bild erneut und nenne die Zielseite oder das Bild, das ersetzt werden soll.';
        await bot.sendMessage(chatId, reply);
        addMessage(chatId, 'assistant', reply);
        return;
      }
      const reply = chatResponse || '✅ Erledigt.';
      await bot.sendMessage(chatId, reply);
      addMessage(chatId, 'assistant', reply);
    }
  } catch (err) {
    console.error('[processRequest] Error:', err);
    rollback(websiteImage ? [websiteImage.repoRelativePath] : []);
    await bot.sendMessage(chatId, '❌ Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
  } finally {
    isBusy = false;
  }
}

// ── Callback handler (user clicks Bestätigen / Abbrechen) ────────────────────

async function handleCallback(update: TelegramUpdate): Promise<void> {
  const cb = update.callback_query!;
  const chatId = cb.message?.chat.id;
  const msgId = cb.message?.message_id;
  const userId = cb.from.id;
  const data = cb.data;

  if (!chatId || !msgId) return;

  if (!isUserAuthorized(userId)) {
    await bot.answerCallback(cb.id, '🚫 Zugang verweigert');
    return;
  }

  const pending = pendingChanges.get(chatId);
  if (!pending) {
    await bot.answerCallback(cb.id, '⚠️ Keine ausstehende Änderung gefunden.');
    await bot.removeKeyboard(chatId, msgId);
    return;
  }

  clearTimeout(pending.timeoutHandle);
  pendingChanges.delete(chatId);

  if (data === 'cancel') {
    await bot.answerCallback(cb.id, 'Abgebrochen');
    rollback(pending.assetPaths);
    await bot.editMessage(chatId, msgId, '❌ Änderung abgebrochen.');
    console.log('[callback] User cancelled change');
    return;
  }

  if (data === 'confirm') {
    await bot.answerCallback(cb.id, 'Bestätigt ✅');
    await bot.removeKeyboard(chatId, msgId);

    isBusy = true;
    try {
      await commitAndRebuild(pending.userMessage, async (msg) => {
        await bot.sendMessage(chatId, msg);
      });

      await bot.sendMessage(
        chatId,
        '✅ <b>Änderung übernommen!</b>\n\nDie Website wird in ~2-4 Minuten aktualisiert.\n' +
          '🔗 <a href="https://musikschule-cms-bielefeld.de">Seite öffnen</a>',
      );
      console.log('[callback] Rebuild triggered successfully');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[callback] Rebuild failed:', errMsg);
      await bot.sendMessage(
        chatId,
        `❌ <b>Fehler beim Neubau der Website:</b>\n<pre>${escapeHtml(errMsg.slice(0, 300))}</pre>\n\nBitte prüfe die Server-Logs.`,
      );
    } finally {
      isBusy = false;
    }
    return;
  }

  await bot.answerCallback(cb.id);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatAgyFailure(stderr: string): string {
  if (/(usage limit|quota|resource exhausted|rate limit)/i.test(stderr)) {
    const resetTime = stderr.match(/try again at ([^.\n]+)/i)?.[1]?.trim();
    return (
      `⏳ <b>Das KI-Kontingent ist vorübergehend ausgeschöpft.</b>\n\n` +
      (resetTime ? `Bitte versuche es nach <b>${escapeHtml(resetTime)}</b> erneut. ` : 'Bitte versuche es später erneut. ') +
      `Das Bild und nicht bestätigte Änderungen wurden sicher verworfen.`
    );
  }

  const errText = stderr.trim().slice(0, 300) || 'Unbekannter AGY-Fehler';
  return `❌ <b>KI-Fehler:</b>\n<pre>${escapeHtml(errText)}</pre>`;
}

// ── Entry point ───────────────────────────────────────────────────────────────

console.log('[server] Starting Musikschule Telegram Admin Bot…');
console.log(`[server] AGY binary: ${config.agyBin}`);
console.log(`[server] AGY model: ${config.agyModel}`);
startServer();
