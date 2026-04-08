/**
 * Musikschule CMS Bielefeld — Telegram Admin Bot
 *
 * HTTPS server on port 8443 (Telegram-supported).
 * Uses the same Let's Encrypt certs as the main nginx site.
 *
 * Flow overview:
 *   text message   → history-aware Gemini call → chat reply OR diff+confirm
 *   voice message  → AssemblyAI transcription → show transcript → same as text
 *   photo message  → download → save temp → same as text (image referenced in prompt)
 *   /command       → instant handler (no Gemini)
 *   callback_query → confirm (deploy) or cancel (rollback)
 */
import https from 'node:https';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { IncomingMessage, ServerResponse } from 'node:http';
import { config } from './config.ts';
import * as bot from './bot.ts';
import { buildPrompt, runGemini, extractChatResponse } from './gemini.ts';
import { getDiff, onlyAllowedFilesChanged, rollback, commitAndRebuild, getRecentLog } from './deploy.ts';
import { transcribeAudio } from './transcribe.ts';
import { addMessage, getHistory, clearHistory } from './history.ts';
import type { TelegramUpdate, PendingChange } from './types.ts';

// ── State ─────────────────────────────────────────────────────────────────────

const processedIds = new Set<number>();
let isBusy = false;
const pendingChanges = new Map<number, PendingChange>();

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
    console.log(`[server] AssemblyAI: ${config.assemblyAiKey ? 'configured ✓' : 'not set (voice disabled)'}`);
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
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

  if (processedIds.has(update.update_id)) return;
  processedIds.add(update.update_id);
  if (processedIds.size > 1000) {
    const first = processedIds.values().next().value!;
    processedIds.delete(first);
  }

  const msg = update.message;
  if (msg) {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    // Whitelist check (applies to all message types)
    if (!userId || !config.allowedUsers.includes(userId)) {
      console.log(`[webhook] Unauthorized user ${userId}`);
      await bot.sendMessage(
        chatId,
        `🚫 Zugang verweigert.\n\nDeine numerische ID: <code>${userId}</code>\n` +
          `Füge diese in TELEGRAM_ALLOWED_USERS in der .env-Datei hinzu.`,
      );
      return;
    }

    if (msg.text?.startsWith('/')) {
      await handleCommand(msg.text, chatId);
    } else if (msg.voice || msg.audio) {
      await handleVoice(chatId, msg.voice?.file_id ?? msg.audio!.file_id, msg.voice?.mime_type ?? msg.audio?.mime_type);
    } else if (msg.photo) {
      const caption = msg.caption?.trim() ?? '';
      await handlePhoto(chatId, msg.photo, caption);
    } else if (msg.text) {
      await processRequest(chatId, msg.text.trim());
    }
  } else if (update.callback_query) {
    await handleCallback(update);
  }
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
          `• Screenshots analysieren (schick ein Bild + Beschreibung)\n\n` +
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
      await bot.sendMessage(chatId, '🧹 Gesprächsverlauf gelöscht.');
      break;

    case '/rollback': {
      if (isBusy) {
        await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
        return;
      }
      try {
        rollback();
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

  if (!caption) {
    await bot.sendMessage(
      chatId,
      '📷 Ich sehe das Bild! Was soll ich ändern? Beschreibe die gewünschte Änderung als Bildunterschrift oder in deiner nächsten Nachricht.',
    );
    // Store pending image info in history as context
    addMessage(chatId, 'user', '[Bild ohne Beschriftung gesendet]');
    addMessage(chatId, 'assistant', 'Bitte beschreibe, was geändert werden soll.');
    return;
  }

  try {
    await bot.sendTyping(chatId);

    // Download the largest photo size
    const largest = photos.reduce((a, b) => (a.file_size ?? 0) > (b.file_size ?? 0) ? a : b);
    const fileInfo = await bot.getFile(largest.file_id);
    const imageBuffer = await bot.downloadFile(fileInfo.file_path);

    // Save to temp file inside the repo so Gemini's file tools can access it
    const adminTmpDir = join(config.siteRepoPath, '.admin_tmp');
    const tmpPath = join(adminTmpDir, `photo_${Date.now()}.jpg`);
    try {
      mkdirSync(adminTmpDir, { recursive: true });
      writeFileSync(tmpPath, imageBuffer);
    } catch {
      // If .admin_tmp doesn't exist, fall back to system temp
      const fallback = join(tmpdir(), `tgbot_photo_${Date.now()}.jpg`);
      writeFileSync(fallback, imageBuffer);
      await processRequest(chatId, caption, fallback);
      try { unlinkSync(fallback); } catch {}
      return;
    }

    try {
      await processRequest(chatId, caption, tmpPath);
    } finally {
      try { unlinkSync(tmpPath); } catch {}
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[photo] Error:', errMsg);
    await bot.sendMessage(
      chatId,
      `❌ Fehler bei der Bildverarbeitung:\n<pre>${escapeHtml(errMsg.slice(0, 200))}</pre>`,
    );
  }
}

// ── Core request processor ────────────────────────────────────────────────────

/**
 * Shared processing pipeline for text, voice transcript, and photo+caption.
 * Runs Gemini → if diff found: show for confirmation; otherwise: show chat reply.
 */
async function processRequest(chatId: number, userText: string, imagePath?: string): Promise<void> {
  if (isBusy) {
    await bot.sendMessage(chatId, '⏳ Gerade läuft eine andere Aktion. Bitte warte.');
    return;
  }

  // Cancel any pending (unconfirmed) change for this chat
  const existing = pendingChanges.get(chatId);
  if (existing) {
    clearTimeout(existing.timeoutHandle);
    rollback();
    pendingChanges.delete(chatId);
  }

  // Add user message to history
  addMessage(chatId, 'user', userText);

  isBusy = true;

  try {
    await bot.sendTyping(chatId);

    const history = getHistory(chatId);
    const prompt = buildPrompt(userText, history, imagePath);
    const geminiResult = await runGemini(prompt);

    if (!geminiResult.success) {
      const errText = geminiResult.stderr.slice(0, 300);
      await bot.sendMessage(
        chatId,
        `❌ <b>KI-Fehler:</b>\n<pre>${escapeHtml(errText)}</pre>`,
      );
      rollback();
      return;
    }

    const chatResponse = extractChatResponse(geminiResult.stdout);
    const diff = getDiff();

    // ── Path A: Gemini made a content change → show diff for confirmation ────
    if (diff) {
      if (!onlyAllowedFilesChanged()) {
        await bot.sendMessage(
          chatId,
          '⚠️ Der KI-Agent hat versucht, andere Dateien zu ändern. Die Änderungen wurden verworfen.',
        );
        rollback();
        return;
      }

      const previewMsgId = await bot.sendDiffPreview(chatId, diff, chatResponse || undefined);

      const timeoutHandle = setTimeout(async () => {
        pendingChanges.delete(chatId);
        rollback();
        await bot.editMessage(chatId, previewMsgId, '⏰ Zeit abgelaufen. Die Änderung wurde verworfen.');
      }, config.confirmTimeoutMs);

      pendingChanges.set(chatId, {
        chatId,
        previewMessageId: previewMsgId,
        diff,
        timeoutHandle,
        userMessage: userText,
      });

      // Store assistant's response in history
      addMessage(chatId, 'assistant', chatResponse || 'Änderung vorbereitet. Bitte bestätigen.');

    // ── Path B: Gemini just chatted → show its text reply ────────────────────
    } else {
      const reply = chatResponse || '✅ Erledigt.';
      await bot.sendMessage(chatId, reply);
      addMessage(chatId, 'assistant', reply);
    }
  } catch (err) {
    console.error('[processRequest] Error:', err);
    rollback();
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

  if (!config.allowedUsers.includes(userId)) {
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
    rollback();
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

// ── Entry point ───────────────────────────────────────────────────────────────

console.log('[server] Starting Musikschule Telegram Admin Bot…');
console.log(`[server] Model: ${config.geminiModel}`);
startServer();
