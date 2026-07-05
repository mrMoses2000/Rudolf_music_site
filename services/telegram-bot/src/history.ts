/**
 * Persistent conversation history backed by SQLite.
 * Replaces the previous in-memory Map — history survives bot restarts.
 *
 * Keeps the last MAX_MESSAGES messages per chat, no older than MAX_AGE_DAYS.
 * Public interface (addMessage / getHistory / formatHistory / clearHistory)
 * is identical to the old in-memory version — no changes needed in callers.
 */
import db from './db.ts';
import type { HistoryMessage } from './types.ts';

const MAX_MESSAGES = 20;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Prepared statements (compiled once, reused on every call) ─────────────────

const stmtInsert = db.prepare(
  'INSERT INTO messages (chat_id, role, text, created_at) VALUES (?, ?, ?, ?)',
);

const stmtSelect = db.prepare(`
  SELECT role, text, created_at
  FROM messages
  WHERE chat_id = ? AND created_at > ?
  ORDER BY created_at DESC
  LIMIT ?
`);

const stmtDelete = db.prepare(
  'DELETE FROM messages WHERE chat_id = ?',
);

// Prune rows older than MAX_AGE_MS for all chats (run occasionally)
const stmtPrune = db.prepare(
  'DELETE FROM messages WHERE created_at < ?',
);

// ── Public API ────────────────────────────────────────────────────────────────

export function addMessage(chatId: number, role: 'user' | 'assistant', text: string): void {
  stmtInsert.run(chatId, role, text, Date.now());
}

/** Returns the last MAX_MESSAGES messages for this chat in chronological order */
export function getHistory(chatId: number): HistoryMessage[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  const rows = stmtSelect.all(chatId, cutoff, MAX_MESSAGES) as Array<{
    role: string;
    text: string;
    created_at: number;
  }>;
  // Query returns newest-first; reverse to get oldest-first (chronological)
  return rows.reverse().map((r) => ({
    role: r.role as 'user' | 'assistant',
    text: r.text,
    timestamp: r.created_at,
  }));
}

/** Format history as a readable block for Codex's context */
export function formatHistory(history: HistoryMessage[]): string {
  if (history.length === 0) return '(no prior conversation)';
  return history
    .map((m) => `${m.role === 'user' ? 'Admin' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

/** Delete all messages for this chat (e.g. on /clear command) */
export function clearHistory(chatId: number): void {
  stmtDelete.run(chatId);
}

/** Prune all messages older than MAX_AGE_MS across all chats */
export function pruneOldMessages(): number {
  const result = stmtPrune.run(Date.now() - MAX_AGE_MS) as { changes: number };
  return result.changes;
}
