/**
 * Thin Telegram Bot API HTTP client.
 * No external SDK — raw HTTPS calls, pattern from tg_keto project.
 */
import https from 'node:https';
import { config } from './config.ts';
import type { TelegramFile } from './types.ts';

const API_BASE = `https://api.telegram.org/bot${config.botToken}`;
const MAX_MESSAGE_LEN = 4096;

// ── Low-level helper ──────────────────────────────────────────────────────────

function apiCall(method: string, body: Record<string, unknown>): Promise<unknown> {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${API_BASE}/${method}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data) as { ok: boolean; result?: unknown; description?: string };
            if (!parsed.ok) {
              console.error(`[bot] Telegram API error [${method}]:`, parsed.description);
            }
            resolve(parsed.result);
          } catch {
            reject(new Error(`Failed to parse Telegram response: ${data}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Show "typing…" indicator in the chat */
export async function sendTyping(chatId: number): Promise<void> {
  await apiCall('sendChatAction', { chat_id: chatId, action: 'typing' });
}

/** Show "recording voice…" indicator (used while transcribing) */
export async function sendRecordingTyping(chatId: number): Promise<void> {
  await apiCall('sendChatAction', { chat_id: chatId, action: 'record_voice' });
}

/** Send a plain text message, returns message_id (0 on failure) */
export async function sendMessage(chatId: number, text: string): Promise<number> {
  const truncated = text.length > MAX_MESSAGE_LEN ? text.slice(0, MAX_MESSAGE_LEN - 30) + '\n…(abgeschnitten)' : text;
  const result = (await apiCall('sendMessage', {
    chat_id: chatId,
    text: truncated,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  })) as { message_id: number } | undefined;
  return result?.message_id ?? 0;
}

/**
 * Send a diff preview with Bestätigen / Abbrechen inline buttons.
 * Optional assistantNote is shown above the diff (Gemini's explanation).
 */
export async function sendDiffPreview(
  chatId: number,
  diff: string,
  assistantNote?: string,
): Promise<number> {
  const diffBlock = formatDiff(diff);
  const noteBlock = assistantNote ? `${escapeHtml(assistantNote)}\n\n` : '';
  const text =
    `${noteBlock}📋 <b>Vorgeschlagene Änderung:</b>\n\n` +
    `<pre>${diffBlock}</pre>\n\n` +
    `Soll diese Änderung übernommen werden?`;

  const safeText =
    text.length > MAX_MESSAGE_LEN
      ? text.slice(0, MAX_MESSAGE_LEN - 60) + '\n…</pre>\n\nSoll diese Änderung übernommen werden?'
      : text;

  const result = (await apiCall('sendMessage', {
    chat_id: chatId,
    text: safeText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Bestätigen', callback_data: 'confirm' },
          { text: '❌ Abbrechen', callback_data: 'cancel' },
        ],
      ],
    },
  })) as { message_id: number } | undefined;
  return result?.message_id ?? 0;
}

/** Edit an existing message (used to update status: pending → done) */
export async function editMessage(chatId: number, messageId: number, text: string): Promise<void> {
  const truncated = text.length > MAX_MESSAGE_LEN ? text.slice(0, MAX_MESSAGE_LEN - 30) + '\n…(abgeschnitten)' : text;
  await apiCall('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: truncated,
    parse_mode: 'HTML',
  });
}

/** Remove inline keyboard from a message */
export async function removeKeyboard(chatId: number, messageId: number): Promise<void> {
  await apiCall('editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] },
  });
}

/** Answer a callback query (clears the loading spinner on the button) */
export async function answerCallback(callbackQueryId: string, text?: string): Promise<void> {
  await apiCall('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

/** Register the webhook with Telegram (call once on startup or setup) */
export async function setWebhook(webhookUrl: string): Promise<void> {
  const result = await apiCall('setWebhook', {
    url: webhookUrl,
    secret_token: config.webhookSecret,
    allowed_updates: ['message', 'callback_query'],
    max_connections: 10,
  });
  console.log('[bot] setWebhook result:', JSON.stringify(result));
}

/** Get file metadata from Telegram (needed to build download URL) */
export async function getFile(fileId: string): Promise<TelegramFile> {
  const result = (await apiCall('getFile', { file_id: fileId })) as TelegramFile | undefined;
  if (!result?.file_path) throw new Error(`getFile returned no file_path for file_id=${fileId}`);
  return result;
}

/** Download raw file bytes from Telegram's CDN */
export async function downloadFile(filePath: string): Promise<Buffer> {
  const url = `https://api.telegram.org/file/bot${config.botToken}/${filePath}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Turn a raw git diff into a readable short summary for Telegram.
 * Shows only the +/- lines (context removed), max 80 chars per line.
 */
function formatDiff(raw: string): string {
  const lines = raw.split('\n');
  const relevant = lines
    .filter((l) => l.startsWith('+') || l.startsWith('-'))
    .filter((l) => !l.startsWith('+++') && !l.startsWith('---'))
    .map((l) => {
      const truncated = l.length > 80 ? l.slice(0, 77) + '…' : l;
      return escapeHtml(truncated);
    });

  if (relevant.length === 0) return escapeHtml(raw.slice(0, 500));

  return relevant.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
