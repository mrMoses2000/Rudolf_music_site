/**
 * Musikschule CMS Bielefeld — Telegram Admin Bot
 *
 * HTTPS server on port 8443 (Telegram-supported).
 * Uses the same Let's Encrypt certs as the main nginx site.
 *
 * Flow:
 *   1. Telegram POSTs update → validate secret header → check whitelist
 *   2. text message  → sendTyping → runGemini → getDiff → sendDiffPreview
 *   3. callback_query "confirm" → commitAndRebuild
 *      callback_query "cancel"  → rollback
 *
 * Patterns from: tg_keto (Python) + Aleksey project (TypeScript)
 */
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import { config } from './config.ts';
import * as bot from './bot.ts';
import { buildPrompt, runGemini } from './gemini.ts';
import { getDiff, onlyContentChanged, rollback, commitAndRebuild } from './deploy.ts';
import type { TelegramUpdate, PendingChange } from './types.ts';

// ── State ─────────────────────────────────────────────────────────────────────

/** Deduplication: ignore already-processed update_ids */
const processedIds = new Set<number>();

/** One operation at a time (mutex) */
let isBusy = false;

/** Per-chat pending confirmation */
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
    console.log(`[server] Webhook path: /api/telegram/webhook`);
    console.log(`[server] Allowed users: ${config.allowedUsers.join(', ') || 'NONE — check TELEGRAM_ALLOWED_USERS!'}`);
  });

  // Graceful shutdown
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
  // 1. Validate Telegram secret header (pattern from tg_keto)
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== config.webhookSecret) {
    // Silent 200 — don't leak info about invalid tokens
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // 2. Read body
  let body = '';
  req.on('data', (chunk: Buffer) => (body += chunk.toString()));
  req.on('end', () => {
    // Always respond 200 immediately to prevent Telegram retries
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));

    // Process asynchronously (don't block the response)
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

  // 3. Idempotency check
  if (processedIds.has(update.update_id)) {
    console.log(`[webhook] Duplicate update_id ${update.update_id}, skipping`);
    return;
  }
  processedIds.add(update.update_id);
  // Keep set from growing unboundedly
  if (processedIds.size > 1000) {
    const first = processedIds.values().next().value!;
    processedIds.delete(first);
  }

  // 4. Route to handler
  if (update.message?.text) {
    await handleMessage(update);
  } else if (update.callback_query) {
    await handleCallback(update);
  }
}

// ── Message handler (user sends a change request) ─────────────────────────────

async function handleMessage(update: TelegramUpdate): Promise<void> {
  const msg = update.message!;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text!.trim();

  // 5. Whitelist check
  // When allowedUsers is empty, block everyone (bootstrap mode — shows numeric ID so user can configure)
  if (!userId || !config.allowedUsers.includes(userId)) {
    console.log(`[webhook] Unauthorized user ${userId} (@${msg.from?.username ?? 'unknown'})`);
    // Return the user's numeric ID so they can add it to TELEGRAM_ALLOWED_USERS
    await bot.sendMessage(
      chatId,
      `🚫 Zugang verweigert.\n\nDeine numerische ID: <code>${userId}</code>\n` +
        `Füge diese in TELEGRAM_ALLOWED_USERS in der .env-Datei hinzu.`,
    );
    return;
  }

  console.log(`[webhook] Message from ${userId}: ${text.slice(0, 80)}`);

  // 6. Mutex — one change at a time
  if (isBusy) {
    await bot.sendMessage(chatId, '⏳ Es läuft bereits eine Änderung. Bitte warte kurz.');
    return;
  }

  // 7. Cancel any previous pending change for this chat
  const existing = pendingChanges.get(chatId);
  if (existing) {
    clearTimeout(existing.timeoutHandle);
    rollback();
    pendingChanges.delete(chatId);
  }

  isBusy = true;

  try {
    // 8. Typing indicator
    await bot.sendTyping(chatId);

    // 9. Spawn Gemini CLI
    const prompt = buildPrompt(text);
    const geminiResult = await runGemini(prompt);

    if (!geminiResult.success) {
      await bot.sendMessage(
        chatId,
        `❌ <b>Fehler beim KI-Agenten:</b>\n<pre>${escapeHtml(geminiResult.stderr.slice(0, 300))}</pre>`,
      );
      rollback();
      return;
    }

    // 10. Get diff — check that only content.js changed
    const diff = getDiff();

    if (!diff) {
      await bot.sendMessage(
        chatId,
        '🤔 Der KI-Agent hat keine Änderungen vorgenommen. Bitte formuliere die Anfrage genauer.',
      );
      return;
    }

    if (!onlyContentChanged()) {
      await bot.sendMessage(
        chatId,
        '⚠️ Der KI-Agent hat versucht, andere Dateien zu ändern. Die Änderungen wurden verworfen.',
      );
      rollback();
      return;
    }

    // 11. Show diff + confirmation buttons
    const previewMsgId = await bot.sendDiffPreview(chatId, diff);

    // 12. Register pending change with 5-min auto-cancel
    const timeoutHandle = setTimeout(async () => {
      pendingChanges.delete(chatId);
      rollback();
      await bot.editMessage(
        chatId,
        previewMsgId,
        '⏰ Zeit abgelaufen. Die Änderung wurde verworfen.',
      );
    }, config.confirmTimeoutMs);

    pendingChanges.set(chatId, { chatId, previewMessageId: previewMsgId, diff, timeoutHandle });
  } catch (err) {
    console.error('[handleMessage] Error:', err);
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

  // Whitelist
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

  // Cancel the auto-timeout
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
      // Get the original user message from pending (we need it for commit msg)
      // We'll use a placeholder here; if needed, store the user message in PendingChange
      await commitAndRebuild(
        'Website content update via Telegram bot',
        async (msg) => {
          await bot.sendMessage(chatId, msg);
        },
      );

      await bot.sendMessage(
        chatId,
        '✅ <b>Änderung übernommen!</b>\n\nDie Website wird in ~2-4 Minuten aktualisiert sein.\n🔗 <a href="https://musikschule-cms-bielefeld.de">Seite öffnen</a>',
      );
      console.log('[callback] Rebuild triggered successfully');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[callback] Rebuild failed:', errMsg);
      await bot.sendMessage(
        chatId,
        `❌ <b>Fehler beim Neubau der Website:</b>\n<pre>${escapeHtml(errMsg.slice(0, 300))}</pre>\n\nBitte überprüfe die Server-Logs.`,
      );
    } finally {
      isBusy = false;
    }
    return;
  }

  // Unknown callback
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
