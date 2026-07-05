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
export async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>,
): Promise<number> {
  const truncated = text.length > MAX_MESSAGE_LEN ? text.slice(0, MAX_MESSAGE_LEN - 30) + '\n…(abgeschnitten)' : text;
  const result = (await apiCall('sendMessage', {
    chat_id: chatId,
    text: truncated,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  })) as { message_id: number } | undefined;
  return result?.message_id ?? 0;
}

export async function sendContactAuthPrompt(chatId: number, userId?: number): Promise<number> {
  return sendMessage(
    chatId,
    `🚫 Zugang verweigert.\n\n` +
      `Deine numerische ID: <code>${userId ?? 'unbekannt'}</code>\n\n` +
      `Wenn deine Telefonnummer freigeschaltet ist, drücke unten auf ` +
      `<b>Kontakt freigeben</b>. Bitte sende deinen eigenen Telegram-Kontakt, keinen gespeicherten Kontakt.`,
    {
      keyboard: [[{ text: '📱 Kontakt freigeben', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  );
}

/**
 * Send a human-readable change preview with confirm/cancel inline buttons.
 * Shows extracted text content (not raw JSON) grouped into Removed/Added.
 */
export async function sendDiffPreview(
  chatId: number,
  diff: string,
  assistantNote?: string,
): Promise<number> {
  const humanDiff = formatDiffHumanReadable(diff);
  const noteBlock = assistantNote ? `${escapeHtml(assistantNote)}\n\n` : '';
  const text = `${noteBlock}${humanDiff}\n\nПодтвердить изменение?`;

  const safeText =
    text.length > MAX_MESSAGE_LEN
      ? text.slice(0, MAX_MESSAGE_LEN - 40) + '\n…\n\nПодтвердить изменение?'
      : text;

  const result = (await apiCall('sendMessage', {
    chat_id: chatId,
    text: safeText,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: 'confirm' },
          { text: '❌ Отменить', callback_data: 'cancel' },
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

const MAX_PREVIEW_ITEMS = 6;

/**
 * Turn a raw git diff of content.js into a human-readable summary.
 * Extracts "text": "..." values from JSON objects and groups them
 * into Removed / Added sections — no raw JSON shown to the user.
 */
function formatDiffHumanReadable(raw: string): string {
  const removed: string[] = [];
  const added: string[] = [];

  for (const line of raw.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) continue;
    if (!line.startsWith('+') && !line.startsWith('-')) continue;

    const isRemoved = line.startsWith('-');
    const content = line.slice(1).trim();
    if (!content) continue;

    // Extract "text": "..." from content.js block objects
    const textMatch = content.match(/"text"\s*:\s*"([^"]+)"/);
    if (textMatch) {
      const val = textMatch[1].length > 70 ? textMatch[1].slice(0, 67) + '…' : textMatch[1];
      (isRemoved ? removed : added).push(val);
      continue;
    }

    // Extract any standalone string value change (phone, email, title, etc.)
    // Matches patterns like:   phone: "+49...",   or   title: "New title",
    const kvMatch = content.match(/(\w+)\s*:\s*"([^"]+)"/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2].length > 60 ? kvMatch[2].slice(0, 57) + '…' : kvMatch[2];
      (isRemoved ? removed : added).push(`${key}: ${val}`);
    }
  }

  const parts: string[] = [];

  if (removed.length > 0) {
    parts.push('🔴 <b>Удалено:</b>');
    for (const t of removed.slice(0, MAX_PREVIEW_ITEMS)) {
      parts.push(`  • ${escapeHtml(t)}`);
    }
    if (removed.length > MAX_PREVIEW_ITEMS) {
      parts.push(`  <i>…и ещё ${removed.length - MAX_PREVIEW_ITEMS}</i>`);
    }
  }

  if (added.length > 0) {
    if (parts.length > 0) parts.push('');
    parts.push('🟢 <b>Добавлено:</b>');
    for (const t of added.slice(0, MAX_PREVIEW_ITEMS)) {
      parts.push(`  • ${escapeHtml(t)}`);
    }
    if (added.length > MAX_PREVIEW_ITEMS) {
      parts.push(`  <i>…и ещё ${added.length - MAX_PREVIEW_ITEMS}</i>`);
    }
  }

  if (parts.length === 0) {
    // Fallback: couldn't parse structured content, show raw snippet
    return `📋 <b>Изменения:</b>\n<pre>${escapeHtml(raw.slice(0, 600))}</pre>`;
  }

  return `📋 <b>Предлагаемые изменения:</b>\n\n${parts.join('\n')}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
