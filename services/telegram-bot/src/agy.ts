/**
 * Google Antigravity (AGY) CLI integration.
 *
 * AGY edits only the site workspace. server.ts validates the resulting git
 * diff before anything can be shown for confirmation or deployed.
 */
import { spawn } from 'node:child_process';
import { config } from './config.ts';
import { formatHistory } from './history.ts';
import type { AgentResult, HistoryMessage } from './types.ts';

interface AgyJsonResult {
  status?: string;
  response?: string;
  error?: string;
}

const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;

/**
 * Detect the admin's conversation language from the current message and history.
 * Checks the current message first; if no clear markers, looks back through history.
 */
function detectLanguage(text: string, history: HistoryMessage[]): string {
  if (/[\u0400-\u04FF]/.test(text)) return 'Russian';
  if (/[äöüßÄÖÜ]/.test(text)) return 'German';

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== 'user') continue;
    if (/[\u0400-\u04FF]/.test(history[i].text)) return 'Russian';
    if (/[äöüßÄÖÜ]/.test(history[i].text)) return 'German';
  }

  return 'the same language the admin is writing in';
}

/** Build the single-turn prompt sent to AGY. */
export function buildPrompt(
  userMessage: string,
  history: HistoryMessage[],
  imagePath?: string,
  imagePublicUrl?: string,
): string {
  const historyText = formatHistory(history);
  const imageSection = imagePath
    ? imagePublicUrl
      ? `
[PREPARED WEBSITE IMAGE]
The admin attached an image. It has already been validated and converted to WebP by the bot.
Its local read-only source is: ${imagePath}
Its public website URL is: ${imagePublicUrl}
Reference exactly this URL in src/data/content.js when publishing the image; never invent another filename or URL.
For a page hero/background, use that page's headerImage field. For the homepage hero use content.hero.image.
For an image inside page content add a block like { "type": "image", "src": "${imagePublicUrl}", "alt": "short German description" }.
For the /about page specifically, use content.pages.about: its blocks array renders inline image blocks, and its headerImage field controls only the hero background.
Do not copy, rename, convert, or modify the binary image file.
`
      : `
[ATTACHED IMAGE]
The admin attached an image stored at ${imagePath}. Use it only as visual context and do not modify it.
`
    : '';
  const langHint = detectLanguage(userMessage, history);

  return `
You are the personal admin assistant for the website "Christliche Musikschule Bielefeld".
You communicate with the admin via Telegram, while the site content itself is German.

CRITICAL — RESPONSE LANGUAGE:
Always reply in ${langHint}. The admin writes in ${langHint}, so you must too.
The site content is in German — that is the SITE language, not your chat language.

CRITICAL — MESSAGE FORMATTING (Telegram HTML):
Your final answer is sent via Telegram with parse_mode HTML.
Rules:
- Use <b>text</b> for bold — NEVER use **text**
- Use <i>text</i> for italic — NEVER use *text* or _text_
- Use emojis naturally and sparingly
- Use bullet points with • for lists
- No markdown syntax at all (no **, *, _, #, ---)

CRITICAL — RESPONSE STYLE:
Give ONE short final answer (3-8 sentences max). Do NOT narrate your thinking process step by step.
Bad: "Сейчас я прочитаю файл… Я нашёл поле… Теперь я изменю его…"
Good: "Меняю заголовок hero на 'Новый текст' ✅"

[CONVERSATION HISTORY]
${historyText}

[CURRENT ADMIN REQUEST]
"${userMessage}"
${imageSection}
[WORKING DIRECTORY]
AGY runs from the site directory: ${config.agyWorkdir}
Use paths relative to this directory.

[EDITABLE FILES — you may read and modify ONLY these]
• src/data/content.js — all text content (titles, descriptions, phone, address, etc.)
• src/index.css — global CSS: fonts, CSS variables (--paper, --ink, --accent), custom classes
• tailwind.config.js — Tailwind theme: color palette, font families
• src/components/Blocks.jsx — TAG_CLASSES object (h1-h4, p styling)
• src/pages/Home.jsx — Hero section layout and Tailwind classes
• src/components/Layout.jsx — Header / navigation styling

[RULES]
1. Reply in ${langHint} with Telegram HTML formatting and emojis
2. If the admin is asking a question or chatting → respond with text only, do NOT touch any files
3. If the admin wants to change text content → edit src/data/content.js
4. If the admin wants to change colors, fonts, sizes, weight → edit the appropriate CSS/JSX/config file from the list above
5. If a prepared website image URL is provided and the admin asks to publish it on a named page → make the website change in src/data/content.js. A request such as “post this image on /about” means append an image block to that page's blocks array; do not ask for a position and do not treat it as a chat-only request. Change headerImage only when the admin explicitly says to replace the hero, background, or header image.
6. A new attached image plus a named page is an explicit request for a file change. Do not finish successfully without changing src/data/content.js unless the exact same image URL is already published there.
7. Never modify any file not in the editable list above
8. Never edit package files, lockfiles, AGENTS.md, markdown logs, build scripts, service code, env files, Git metadata, or generated assets
9. Do not run git, deploy, package-manager, network, or service-management commands; the bot owns validation and deployment
10. Preserve file structure — no adding/removing keys in JS objects unless the admin explicitly asks, except an explicitly requested image block
11. Be surgical — change only the exact field(s)/class(es) specified; never touch adjacent code
12. If the request is ambiguous or could match multiple things → list the options and ask, make NO changes. A named page plus “post/publish this image” is not ambiguous: use an inline image block by default.
13. When changing Tailwind classes in JSX, only modify the specific class, never rewrite the whole className string
`.trim();
}

/** Convert markdown-like output to Telegram-safe HTML. */
function markdownToTelegramHtml(text: string): string {
  let result = text
    .replace(/&(?![a-zA-Z0-9#]+;)/g, '&amp;')
    .replace(/<(?!\/?(?:b|i|u|s|code|pre|a)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|s|code|pre|a))>/g, '&gt;');

  result = result.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>');
  result = result.replace(/__(.+?)__/gs, '<b>$1</b>');
  result = result.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  // Do not treat underscores inside identifiers (for example AGY_E2E_OK) as italics.
  result = result.replace(/(?<![\p{L}\p{N}])_([^_\n]+)_(?![\p{L}\p{N}])/gu, '<i>$1</i>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/^#{1,4}\s+(.+)$/gm, '<b>$1</b>');
  result = result.replace(/^---+$/gm, '──────────');

  return result;
}

export function extractChatResponse(stdout: string): string {
  if (!stdout.trim()) return '';
  const clean = stdout.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim().replace(/\n{3,}/g, '\n\n');
  return markdownToTelegramHtml(clean.slice(0, 4000));
}

function parseAgyStreamResult(stdout: string): AgyJsonResult {
  const lines = stdout.split('\n').map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const parsed: unknown = JSON.parse(lines[i]);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue;
    const event = parsed as { event?: string; result?: unknown };
    if (event.event === 'result' && event.result && typeof event.result === 'object') {
      return event.result as AgyJsonResult;
    }
  }
  throw new Error('AGY stream did not contain a terminal result event');
}

/** Run one isolated AGY headless turn. */
export async function runAgy(prompt: string): Promise<AgentResult> {
  return new Promise((resolve) => {
    const printTimeoutSeconds = Math.max(1, Math.ceil(config.agyTimeoutMs / 1000));
    const args = [
      '--add-dir', config.agyWorkdir,
      '--model', config.agyModel,
      '--mode', 'accept-edits',
      '--sandbox',
      '--disable-slash-commands',
      '--input-format', 'stream-json',
      '--output-format', 'stream-json',
      '--print-timeout', `${printTimeoutSeconds}s`,
    ];

    console.log(`[agy] Spawning: ${config.agyBin} --add-dir ${config.agyWorkdir} --model ${config.agyModel} --mode accept-edits --sandbox …`);
    const child = spawn(config.agyBin, args, {
      cwd: config.agyWorkdir,
      detached: true,
      env: {
        ...process.env,
        HOME: process.env.HOME || '/home/ubuntu',
        PATH: [
          process.env.PATH || '',
          '/home/ubuntu/.local/bin',
          '/usr/local/bin',
          '/usr/bin',
          '/bin',
        ].filter(Boolean).join(':'),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Stream mode keeps the full admin prompt out of the process list. Closing
    // stdin after one event asks AGY to finish that turn and exit cleanly.
    child.stdin.end(`${JSON.stringify({ event: 'user', message: { content: prompt } })}\n`);

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let captureExceeded = false;

    const capture = (current: string, chunk: Buffer): string => {
      const next = current + chunk.toString();
      if (Buffer.byteLength(next) > MAX_CAPTURE_BYTES) {
        captureExceeded = true;
        try { process.kill(-child.pid!, 'SIGTERM'); } catch {}
        return next.slice(0, MAX_CAPTURE_BYTES);
      }
      return next;
    };

    child.stdout.on('data', (chunk: Buffer) => { stdout = capture(stdout, chunk); });
    child.stderr.on('data', (chunk: Buffer) => { stderr = capture(stderr, chunk); });

    const timer = setTimeout(() => {
      timedOut = true;
      console.error('[agy] Timeout — killing process group');
      try { process.kill(-child.pid!, 'SIGTERM'); } catch {}
      setTimeout(() => {
        try { process.kill(-child.pid!, 'SIGKILL'); } catch {}
      }, 5000).unref();
    }, config.agyTimeoutMs + 5000);

    child.on('close', (code) => {
      clearTimeout(timer);

      let envelope: AgyJsonResult | undefined;
      let parseError = '';
      try {
        envelope = parseAgyStreamResult(stdout);
      } catch (err) {
        parseError = err instanceof Error ? err.message : String(err);
      }

      const success = code === 0
        && !timedOut
        && !captureExceeded
        && envelope?.status === 'SUCCESS'
        && typeof envelope.response === 'string';

      if (success) {
        console.log('[agy] completed successfully');
      } else {
        console.error(`[agy] failed: code=${code}, status=${envelope?.status || 'unknown'}`);
        if (stderr) console.error('[agy] stderr:', stderr.slice(0, 500));
      }

      const reasons = [
        timedOut ? `AGY timed out after ${config.agyTimeoutMs}ms` : '',
        captureExceeded ? 'AGY output exceeded the safety limit' : '',
        envelope?.error || '',
        parseError,
        stderr,
      ].filter(Boolean);

      resolve({
        success,
        stdout: envelope?.response || '',
        stderr: reasons.join('\n').trim(),
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      console.error('[agy] spawn error:', err.message);
      resolve({ success: false, stdout: '', stderr: err.message });
    });
  });
}
