/**
 * Gemini CLI integration.
 *
 * Always runs with --yolo (auto-approve tools).
 * Whether Gemini edits content.js or just chats is its own decision —
 * server.ts checks getDiff() afterwards to know which path to take.
 */
import { spawn } from 'node:child_process';
import { config } from './config.ts';
import { formatHistory } from './history.ts';
import type { GeminiResult, HistoryMessage } from './types.ts';

/**
 * Detect the admin's conversation language from the current message and history.
 * Checks the current message first; if no clear markers, looks back through history.
 * Switching language mid-conversation is supported — the latest message wins.
 */
function detectLanguage(text: string, history: HistoryMessage[]): string {
  // Current message takes priority (allows switching)
  if (/[\u0400-\u04FF]/.test(text)) return 'Russian';
  if (/[äöüßÄÖÜ]/.test(text)) return 'German';

  // No clear markers in current message — check recent user messages (newest first)
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== 'user') continue;
    if (/[\u0400-\u04FF]/.test(history[i].text)) return 'Russian';
    if (/[äöüßÄÖÜ]/.test(history[i].text)) return 'German';
  }

  return 'the same language the admin is writing in';
}

/**
 * Build the prompt sent to Gemini CLI.
 * Includes conversation history and optional image reference.
 */
export function buildPrompt(
  userMessage: string,
  history: HistoryMessage[],
  imagePath?: string,
): string {
  const historyText = formatHistory(history);
  const imageSection = imagePath
    ? `\n[SCREENSHOT]\nThe admin sent a screenshot. File: @${imagePath}\nUse it to understand the visual context of their request.\n`
    : '';
  const langHint = detectLanguage(userMessage, history);

  return `
You are the personal admin assistant for the website "Christliche Musikschule Bielefeld".
You communicate with the admin via Telegram.

CRITICAL — RESPONSE LANGUAGE:
Always reply in ${langHint}. The admin writes in ${langHint}, so you must too.
The site content is in German — that is the SITE language, not your chat language.
Never switch language just because you read German in content.js.

CRITICAL — MESSAGE FORMATTING (Telegram HTML):
Your messages are sent via Telegram with parse_mode HTML.
Rules:
- Use <b>text</b> for bold — NEVER use **text**
- Use <i>text</i> for italic — NEVER use *text* or _text_
- Use emojis naturally and warmly to make conversation pleasant 😊
- Use bullet points with • or relevant emojis for lists
- Keep messages short and conversational — no walls of text
- No markdown syntax at all (no **, *, _, #, ---)

[CONVERSATION HISTORY]
${historyText}

[CURRENT ADMIN REQUEST]
"${userMessage}"
${imageSection}
[RULES]
1. Reply in ${langHint} with Telegram HTML formatting and emojis
2. If the admin is asking a question or chatting → respond with text only, do NOT touch any files
3. If the admin wants to change site content → edit ONLY \`site/src/data/content.js\`
4. Never modify any file other than \`site/src/data/content.js\`
5. Preserve the JavaScript structure exactly — no adding or removing keys
6. If the request is ambiguous → ask a clarifying question, make NO changes
7. You may read \`site/src/data/content.js\` to answer questions about current content
`.trim();
}

/**
 * Convert Gemini's markdown output to Telegram HTML.
 * Gemini sometimes ignores the formatting instruction and outputs markdown —
 * this catches it as a fallback.
 */
function markdownToTelegramHtml(text: string): string {
  // Escape raw HTML special chars first (before adding our own tags)
  let result = text
    .replace(/&(?![a-zA-Z0-9#]+;)/g, '&amp;')
    .replace(/<(?!\/?(?:b|i|u|s|code|pre|a)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|s|code|pre|a))>/g, '&gt;');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>');
  result = result.replace(/__(.+?)__/gs, '<b>$1</b>');
  // Italic: *text* or _text_ (single, not double)
  result = result.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  result = result.replace(/_([^_\n]+)_/g, '<i>$1</i>');
  // Inline code: `text`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headers: ### text → <b>text</b>
  result = result.replace(/^#{1,4}\s+(.+)$/gm, '<b>$1</b>');
  // Horizontal rule: --- → thin separator
  result = result.replace(/^---+$/gm, '──────────');

  return result;
}

/**
 * Extract the human-readable chat response from Gemini CLI stdout.
 * Strips ANSI codes, filters noise lines, and converts markdown to Telegram HTML.
 */
export function extractChatResponse(stdout: string): string {
  if (!stdout.trim()) return '';

  // Strip ANSI escape codes
  let clean = stdout.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();

  // Remove well-known Gemini CLI noise
  clean = clean
    .replace(/YOLO mode is enabled[^\n]*/g, '')
    .replace(/Loaded cached credentials[^\n]*/g, '')
    .replace(/Keychain initialization[^\n]*/g, '')
    .replace(/Using FileKeychain[^\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n');

  const lines = clean.split('\n').filter((line) => {
    const t = line.trim();
    if (!t) return false;
    if (/^[✓✗⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏►◆▸]/.test(t)) return false;
    if (/^(Reading|Writing|Updating|Creating|Deleting|Editing|Running|Checking)\b/i.test(t)) return false;
    return true;
  });

  const rawText = lines.join('\n').trim().slice(0, 4000);

  // Convert any remaining markdown to Telegram HTML
  return markdownToTelegramHtml(rawText);
}

/**
 * Run Gemini CLI as a child process.
 */
export async function runGemini(prompt: string): Promise<GeminiResult> {
  return new Promise((resolve) => {
    console.log(`[gemini] Spawning: gemini --model ${config.geminiModel} --yolo -p "…"`);

    const child = spawn(
      'gemini',
      ['--model', config.geminiModel, '--yolo', '-p', prompt],
      {
        cwd: config.siteRepoPath,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    const timer = setTimeout(() => {
      console.error('[gemini] Timeout — killing child process');
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, config.geminiTimeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      const success = code === 0;
      if (!success) {
        console.error(`[gemini] exited with code ${code}`);
        console.error('[gemini] stderr:', stderr.slice(0, 500));
      } else {
        console.log('[gemini] completed successfully');
      }
      resolve({ success, stdout, stderr });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      console.error('[gemini] spawn error:', err.message);
      resolve({ success: false, stdout: '', stderr: err.message });
    });
  });
}
