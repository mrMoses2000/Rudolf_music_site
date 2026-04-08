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
 * Build the prompt sent to Gemini CLI.
 * Includes conversation history and optional image reference.
 */
export function buildPrompt(
  userMessage: string,
  history: HistoryMessage[],
  imagePath?: string,
): string {
  const historyText = formatHistory(history);

  // Reference image inline using @filepath syntax (Gemini CLI reads it natively)
  const imageSection = imagePath
    ? `\n[SCREENSHOT]\nThe admin sent a screenshot. File: @${imagePath}\nUse it to understand the visual context of their request.\n`
    : '';

  return `
You are the personal admin assistant for the website "Christliche Musikschule Bielefeld" (musikschule-cms-bielefeld.de).
You help the admin manage site content through a Telegram chat interface.

[CONVERSATION HISTORY]
${historyText}

[CURRENT ADMIN REQUEST]
"${userMessage}"
${imageSection}
[RULES]
1. If the admin is asking a question, chatting, or needs clarification → respond with TEXT ONLY, do NOT touch any files
2. If the admin wants to change website content → edit ONLY \`site/src/data/content.js\`
3. Never modify any file other than \`site/src/data/content.js\`
4. Preserve the JavaScript structure exactly — no adding or removing keys
5. Respond in the admin's language (Russian, German, or English — match what they write)
6. If the request is ambiguous → ask a clarifying question, make NO changes
7. You may read \`site/src/data/content.js\` to answer questions about current content
`.trim();
}

/**
 * Extract the human-readable chat response from Gemini CLI stdout.
 * Strips ANSI codes and filters out tool-call status lines.
 */
export function extractChatResponse(stdout: string): string {
  if (!stdout.trim()) return '';

  // Strip ANSI escape codes
  const clean = stdout.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();

  const lines = clean.split('\n').filter((line) => {
    const t = line.trim();
    if (!t) return false;
    // Skip spinner / progress glyphs emitted by Gemini CLI
    if (/^[✓✗⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏►◆▸]/.test(t)) return false;
    // Skip tool-call status lines ("Reading …", "Writing …", etc.)
    if (/^(Reading|Writing|Updating|Creating|Deleting|Editing|Running|Checking)\b/i.test(t)) return false;
    return true;
  });

  return lines.join('\n').trim();
}

/**
 * Run Gemini CLI as a child process.
 * Optionally pass an image path (Gemini CLI @filepath inline syntax is embedded in the prompt).
 */
export async function runGemini(prompt: string): Promise<GeminiResult> {
  return new Promise((resolve) => {
    console.log(`[gemini] Spawning: gemini --model ${config.geminiModel} --yolo -p "…"`);

    const child = spawn(
      'gemini',
      [
        '--model', config.geminiModel,
        '--yolo',
        '-p', prompt,
      ],
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
