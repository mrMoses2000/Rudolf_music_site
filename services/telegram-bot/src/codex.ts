/**
 * Codex CLI integration.
 *
 * Runs `codex exec` non-interactively. server.ts checks git diff afterwards to
 * decide whether Codex changed the site or only answered the admin.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from './config.ts';
import { formatHistory } from './history.ts';
import type { AgentResult, HistoryMessage } from './types.ts';

/**
 * Detect the admin's conversation language from the current message and history.
 * Checks the current message first; if no clear markers, looks back through history.
 * Switching language mid-conversation is supported — the latest message wins.
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

/**
 * Build the prompt sent to Codex CLI.
 * Includes conversation history and optional image reference.
 */
export function buildPrompt(
  userMessage: string,
  history: HistoryMessage[],
  imagePath?: string,
): string {
  const historyText = formatHistory(history);
  const imageSection = imagePath
    ? `\n[SCREENSHOT]\nThe admin attached a screenshot/image to this Codex run. Use it only to understand the visual context of the request.\n`
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
Codex runs from the site directory: ${config.codexWorkdir}
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
5. Never modify any file not in the editable list above
6. Never edit package files, lockfiles, AGENTS.md, markdown logs, build scripts, service code, env files, or generated assets
7. Preserve file structure — no adding/removing keys in JS objects unless the admin explicitly asks
8. Be surgical — change only the exact field(s)/class(es) specified; never touch adjacent code
9. If the request is ambiguous or could match multiple things → list the options and ask, make NO changes
10. When changing Tailwind classes in JSX, only modify the specific class, never rewrite the whole className string
`.trim();
}

/**
 * Convert markdown-like output to Telegram HTML when Codex does not follow the
 * HTML instruction exactly.
 */
function markdownToTelegramHtml(text: string): string {
  let result = text
    .replace(/&(?![a-zA-Z0-9#]+;)/g, '&amp;')
    .replace(/<(?!\/?(?:b|i|u|s|code|pre|a)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|s|code|pre|a))>/g, '&gt;');

  result = result.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>');
  result = result.replace(/__(.+?)__/gs, '<b>$1</b>');
  result = result.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  result = result.replace(/_([^_\n]+)_/g, '<i>$1</i>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/^#{1,4}\s+(.+)$/gm, '<b>$1</b>');
  result = result.replace(/^---+$/gm, '──────────');

  return result;
}

/**
 * Extract the human-readable chat response from Codex CLI output.
 */
export function extractChatResponse(stdout: string): string {
  if (!stdout.trim()) return '';

  let clean = stdout.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
  clean = clean.replace(/\n{3,}/g, '\n\n');

  const rawText = clean
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (/^(Reading|Writing|Updating|Creating|Deleting|Editing|Running|Checking)\b/i.test(t)) return false;
      return true;
    })
    .join('\n')
    .trim()
    .slice(0, 4000);

  return markdownToTelegramHtml(rawText);
}

/**
 * Run Codex CLI as a child process.
 */
export async function runCodex(prompt: string, imagePath?: string): Promise<AgentResult> {
  return new Promise((resolve) => {
    const outputPath = join(tmpdir(), `musikschule_codex_${process.pid}_${Date.now()}.txt`);
    const args = [
      'exec',
      '--ephemeral',
      '--sandbox',
      config.codexSandbox,
      '--cd',
      config.codexWorkdir,
      '--output-last-message',
      outputPath,
    ];

    if (config.codexModel) args.push('--model', config.codexModel);
    if (imagePath) args.push('--image', imagePath);
    args.push(prompt);

    console.log(`[codex] Spawning: ${config.codexBin} exec --sandbox ${config.codexSandbox} --cd ${config.codexWorkdir} …`);

    const child = spawn(config.codexBin, args, {
      cwd: config.codexWorkdir,
      env: {
        ...process.env,
        HOME: process.env.HOME || '/home/ubuntu',
        PATH: [
          process.env.PATH || '',
          '/home/ubuntu/.nvm/versions/node/v24.14.1/bin',
          '/usr/local/bin',
          '/usr/bin',
          '/bin',
        ].filter(Boolean).join(':'),
        ...(config.codexHome ? { CODEX_HOME: config.codexHome } : {}),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    const timer = setTimeout(() => {
      timedOut = true;
      console.error('[codex] Timeout — killing child process');
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, config.codexTimeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);

      let finalOutput = stdout;
      if (existsSync(outputPath)) {
        try {
          finalOutput = readFileSync(outputPath, 'utf8');
        } catch (err) {
          console.error('[codex] Cannot read last-message output:', err);
        } finally {
          try { unlinkSync(outputPath); } catch {}
        }
      }

      const success = code === 0 && !timedOut;
      if (!success) {
        console.error(`[codex] exited with code ${code}`);
        console.error('[codex] stderr:', stderr.slice(0, 500));
      } else {
        console.log('[codex] completed successfully');
      }

      resolve({
        success,
        stdout: finalOutput,
        stderr: timedOut ? `${stderr}\nCodex timed out after ${config.codexTimeoutMs}ms`.trim() : stderr,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      try { unlinkSync(outputPath); } catch {}
      console.error('[codex] spawn error:', err.message);
      resolve({ success: false, stdout: '', stderr: err.message });
    });
  });
}
