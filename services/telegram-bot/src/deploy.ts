/**
 * Git operations and site rebuild pipeline.
 *
 * Flow:
 *   getDiff()    → show diff to user for confirmation
 *   rollback()   → git checkout (user cancelled or Codex failed)
 *   commitAndRebuild() → git commit + bash run.sh (user confirmed)
 */
import { execFileSync, spawn } from 'node:child_process';
import { config } from './config.ts';
import { cleanupPreparedImages } from './media.ts';

const REPO = config.siteRepoPath;
/**
 * Files the admin bot is allowed to modify via Codex.
 * Everything else is rejected to protect the site from accidental breakage.
 */
const ALLOWED_FILES: readonly string[] = [
  'site/src/data/content.js',       // text content
  'site/src/index.css',             // global CSS, fonts, CSS variables
  'site/tailwind.config.js',        // Tailwind theme: colors, fonts
  'site/src/components/Blocks.jsx', // TAG_CLASSES — heading/text styling
  'site/src/pages/Home.jsx',        // Hero section layout + inline classes
  'site/src/components/Layout.jsx', // Header / navigation styling
];

const ADMIN_IMAGE_PATTERN = /^site\/public\/images\/admin\/telegram-[a-zA-Z0-9_-]+\.webp$/;

// When running as root (systemd), git refuses to operate in repos owned by other users.
// This is safe here because we intentionally manage this specific repo.
const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', HOME: process.env.HOME ?? '/root' };

function git(args: readonly string[]): string {
  return execFileSync('git', ['-C', REPO, '-c', `safe.directory=${REPO}`, ...args], {
    encoding: 'utf8',
    env: GIT_ENV,
  });
}

function isAllowedFile(file: string): boolean {
  return ALLOWED_FILES.includes(file) || ADMIN_IMAGE_PATTERN.test(file);
}

function getChangedFiles(): string[] {
  const tracked = [
    ...git(['diff', '--name-only']).split('\n'),
    ...git(['diff', '--cached', '--name-only']).split('\n'),
  ];
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n');
  return Array.from(new Set([...tracked, ...untracked].map((file) => file.trim()).filter(Boolean)));
}

// ── Git helpers ───────────────────────────────────────────────────────────────

/** Returns the git diff for all allowed files, or empty string if no changes. */
export function getDiff(): string {
  try {
    const trackedDiff = git(['diff', '--no-ext-diff']).trim();
    if (!trackedDiff) return '';

    const newImages = getChangedFiles().filter((file) => ADMIN_IMAGE_PATTERN.test(file));
    const imageSummary = newImages.length
      ? `\n\nNeue Bilddateien:\n${newImages.map((file) => `+ ${file}`).join('\n')}`
      : '';
    return `${trackedDiff}${imageSummary}`.trim();
  } catch {
    return '';
  }
}

/**
 * Check that ONLY allowed files were modified.
   * Extra safety: if Codex touched other files we roll back and reject.
 */
export function onlyAllowedFilesChanged(): boolean {
  try {
    const files = getChangedFiles();
    return files.length > 0 && files.every(isAllowedFile);
  } catch {
    return false;
  }
}

/** Discard all uncommitted changes in the working tree (rollback). */
export function rollback(assetPaths: readonly string[] = []): void {
  try {
    git(['restore', '--staged', '--worktree', '--', '.']);
    console.log('[deploy] Rollback complete');
  } catch (err) {
    console.error('[deploy] Rollback failed:', err);
  } finally {
    cleanupPreparedImages(assetPaths);
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
  // 1. Commit all changed allowed files
  await onProgress('📝 Commit wird erstellt…');
  const changed = getChangedFiles();
  if (changed.length === 0 || !changed.every(isAllowedFile)) {
    throw new Error('No allowed changes found to commit.');
  }
  for (const f of changed) {
    git(['add', '--', f]);
  }
  git(['commit', '-m', `TG Bot: ${sanitizeCommitMsg(userMessage)}`]);
  console.log('[deploy] Committed changes:', changed.join(', '));

  // 2. Rebuild
  await onProgress('🏗️ Website wird neu gebaut… (dauert ~2-4 Minuten)');
  await runRebuild();
  console.log('[deploy] Rebuild complete');
}

/** Returns the last N git log entries as a formatted string */
export function getRecentLog(n = 5): string {
  return git(['log', '--oneline', `-${n}`]).trim();
}

function sanitizeCommitMsg(msg: string): string {
  // Strip newlines and limit length for a clean commit message
  return msg.replace(/\n/g, ' ').slice(0, 72);
}

function runRebuild(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[deploy] Running run.sh…');

    // Systemd gives a minimal environment — ensure common tool paths are present.
    const fullPath = [
      '/usr/local/sbin', '/usr/local/bin',
      '/usr/sbin', '/usr/bin', '/sbin', '/bin',
      '/snap/bin',                   // snap-installed docker on Ubuntu
    ].join(':');

    const child = spawn('bash', ['run.sh'], {
      cwd: REPO,
      env: { ...process.env, PATH: fullPath },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const outputChunks: string[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write('[run.sh] ' + text);
      outputChunks.push(text);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      process.stderr.write('[run.sh] ' + text);
      outputChunks.push(text);
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
        // Include last 20 lines of output so user can see what failed
        const tail = outputChunks
          .join('')
          .split('\n')
          .filter(Boolean)
          .slice(-20)
          .join('\n');
        reject(new Error(`run.sh exited with code ${code}\n\nПоследние строки вывода:\n${tail}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
