/**
 * Git operations and site rebuild pipeline.
 *
 * Flow:
 *   getDiff()    → show diff to user for confirmation
 *   rollback()   → git checkout (user cancelled or Gemini failed)
 *   commitAndRebuild() → git commit + bash run.sh (user confirmed)
 */
import { execSync, spawn } from 'node:child_process';
import { config } from './config.ts';

const REPO = config.siteRepoPath;
const CONTENT = config.contentFile;

// When running as root (systemd), git refuses to operate in repos owned by other users.
// This is safe here because we intentionally manage this specific repo.
const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', HOME: process.env.HOME ?? '/root' };

function git(args: string): string {
  return execSync(`git -C "${REPO}" -c safe.directory="${REPO}" ${args}`, {
    encoding: 'utf8',
    env: GIT_ENV,
  });
}

// ── Git helpers ───────────────────────────────────────────────────────────────

/** Returns the git diff of content.js, or empty string if no changes. */
export function getDiff(): string {
  try {
    return git(`diff -- "${CONTENT}"`).trim();
  } catch {
    return '';
  }
}

/**
 * Check that ONLY content.js was modified.
 * Extra safety: if Gemini touched other files we roll back and reject.
 */
export function onlyContentChanged(): boolean {
  try {
    const changed = git('diff --name-only').trim();
    const files = changed.split('\n').filter(Boolean);
    return files.length > 0 && files.every((f) => f === CONTENT);
  } catch {
    return false;
  }
}

/** Discard all uncommitted changes in the working tree (rollback). */
export function rollback(): void {
  try {
    git('checkout -- .');
    console.log('[deploy] Rollback complete');
  } catch (err) {
    console.error('[deploy] Rollback failed:', err);
  }
}

// ── Commit + Rebuild ──────────────────────────────────────────────────────────

/**
 * Commit the content.js change and rebuild + redeploy the site.
 * The rebuild (run.sh) takes ~2-4 minutes and is awaited asynchronously.
 *
 * @param onProgress  callback called with progress messages during rebuild
 */
export async function commitAndRebuild(
  userMessage: string,
  onProgress: (msg: string) => Promise<void>,
): Promise<void> {
  // 1. Commit
  await onProgress('📝 Commit wird erstellt…');
  git(`add "${CONTENT}"`);
  git(`commit -m "TG Bot: ${sanitizeCommitMsg(userMessage)}"`);
  console.log('[deploy] Committed content change');

  // 2. Rebuild
  await onProgress('🏗️ Website wird neu gebaut… (dauert ~2-4 Minuten)');
  await runRebuild();
  console.log('[deploy] Rebuild complete');
}

/** Returns the last N git log entries as a formatted string */
export function getRecentLog(n = 5): string {
  return git(`log --oneline -${n}`).trim();
}

function sanitizeCommitMsg(msg: string): string {
  // Strip newlines and limit length for a clean commit message
  return msg.replace(/\n/g, ' ').slice(0, 72);
}

function runRebuild(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[deploy] Running run.sh…');
    const child = spawn('bash', ['run.sh'], {
      cwd: REPO,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write('[run.sh] ' + chunk.toString());
    });
    child.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write('[run.sh] ' + chunk.toString());
    });

    // run.sh can take several minutes — give it 10 minutes max
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('run.sh timed out after 10 minutes'));
    }, 10 * 60 * 1000);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`run.sh exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
