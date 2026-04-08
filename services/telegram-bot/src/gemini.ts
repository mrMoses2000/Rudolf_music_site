/**
 * Spawns Gemini CLI as a child process to edit site content.
 * Pattern from: Aleksey project (services/worker/src/gemini.ts) + tg_keto (llm/executor.py).
 */
import { spawn } from 'node:child_process';
import { config } from './config.ts';
import type { GeminiResult } from './types.ts';

/**
 * Build the prompt sent to Gemini CLI.
 * We tell it exactly what the user wants, in which file, and which language to respond in.
 */
export function buildPrompt(userMessage: string): string {
  return `
Du bist ein Content-Editor für die Website der Christlichen Musikschule Bielefeld.

Der Website-Administrator möchte folgende Änderung an der Website vornehmen:
"${userMessage}"

Bitte nimm die gewünschte Änderung in der Datei \`site/src/data/content.js\` vor.
Wichtig:
- Ändere NUR den/die betroffenen Wert(e) in content.js
- Behalte die JavaScript/JSON-Struktur EXAKT bei (kein Hinzufügen/Entfernen von Feldern)
- Ändere KEINE anderen Dateien
- Falls die Anfrage unklar ist, mache KEINE Änderungen und schreibe eine Erklärung
`.trim();
}

/**
 * Run Gemini CLI as a child process with the given prompt.
 * CWD is set to the site repo root so GEMINI.md and all files are accessible.
 *
 * @returns stdout/stderr output + success flag
 */
export async function runGemini(prompt: string): Promise<GeminiResult> {
  return new Promise((resolve) => {
    console.log(`[gemini] Spawning: gemini --model ${config.geminiModel} --yolo -p "…"`);

    const child = spawn(
      'gemini',
      [
        '--model', config.geminiModel,
        '--yolo',           // auto-approve all tool calls (file edits, reads)
        '-p', prompt,
      ],
      {
        cwd: config.siteRepoPath,
        env: process.env,   // OAuth credentials are in the home dir (~/.gemini/), inherited automatically
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    // Kill after timeout
    const timer = setTimeout(() => {
      console.error('[gemini] Timeout — killing child process');
      child.kill('SIGTERM');
      // Give it 5s to die gracefully, then SIGKILL
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
