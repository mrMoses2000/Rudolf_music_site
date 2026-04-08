/**
 * In-memory conversation history per chat.
 * Messages older than MAX_AGE_MS are pruned on read.
 */
import type { HistoryMessage } from './types.ts';

const MAX_MESSAGES = 10;
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

const histories = new Map<number, HistoryMessage[]>();

export function addMessage(chatId: number, role: 'user' | 'assistant', text: string): void {
  const history = histories.get(chatId) ?? [];
  history.push({ role, text, timestamp: Date.now() });
  if (history.length > MAX_MESSAGES) {
    history.splice(0, history.length - MAX_MESSAGES);
  }
  histories.set(chatId, history);
}

/** Returns fresh (non-expired) messages for this chat */
export function getHistory(chatId: number): HistoryMessage[] {
  const history = histories.get(chatId) ?? [];
  const cutoff = Date.now() - MAX_AGE_MS;
  const fresh = history.filter((m) => m.timestamp > cutoff);
  histories.set(chatId, fresh);
  return fresh;
}

/** Format history as a readable block for Gemini's context */
export function formatHistory(history: HistoryMessage[]): string {
  if (history.length === 0) return '(no prior conversation)';
  return history
    .map((m) => `${m.role === 'user' ? 'Admin' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

export function clearHistory(chatId: number): void {
  histories.delete(chatId);
}
