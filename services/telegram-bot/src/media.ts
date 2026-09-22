import {
  chownSync,
  constants,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { config } from './config.ts';

const ADMIN_IMAGE_DIR = 'site/public/images/admin';
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function giveToRepositoryOwner(path: string): void {
  if (typeof process.getuid !== 'function' || process.getuid() !== 0) return;

  const { uid, gid } = statSync(config.siteRepoPath);
  chownSync(path, uid, gid);
}

export interface PreparedWebsiteImage {
  absolutePath: string;
  repoRelativePath: string;
  publicUrl: string;
  tempDirectory?: string;
}

function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
    return 'png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

function runFfmpeg(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      config.ffmpegPath,
      [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-i', inputPath,
        '-vf', 'scale=w=min(1920\\,iw):h=-2:flags=lanczos',
        '-frames:v', '1',
        '-c:v', 'libwebp',
        '-quality', '82',
        '-compression_level', '5',
        outputPath,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );

    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-400)}`));
      }
    });
  });
}

export async function prepareWebsiteImage(
  buffer: Buffer,
  telegramUniqueId: string,
): Promise<PreparedWebsiteImage> {
  if (buffer.length === 0) throw new Error('Die Bilddatei ist leer.');
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Das Bild ist größer als 15 MB. Bitte sende eine kleinere Datei.');
  }

  const inputExtension = detectImageExtension(buffer);
  if (!inputExtension) {
    throw new Error('Unterstützt werden JPEG-, PNG- und WebP-Bilder.');
  }

  const safeUniqueId = telegramUniqueId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'image';
  const fileName = `telegram-${Date.now()}-${safeUniqueId}.webp`;
  const repoRelativePath = `${ADMIN_IMAGE_DIR}/${fileName}`;
  const tempDir = mkdtempSync(join(tmpdir(), 'musikschule-image-'));
  const inputPath = join(tempDir, `input.${inputExtension}`);
  const outputPath = join(tempDir, fileName);
  writeFileSync(inputPath, buffer, { flag: 'wx' });

  try {
    await runFfmpeg(inputPath, outputPath);
  } catch (err) {
    rmSync(tempDir, { recursive: true, force: true });
    throw err;
  }

  return {
    absolutePath: outputPath,
    repoRelativePath,
    publicUrl: `/images/admin/${fileName}`,
    tempDirectory: tempDir,
  };
}

export function activateWebsiteImage(image: PreparedWebsiteImage): PreparedWebsiteImage {
  if (!image.tempDirectory) return image;

  const outputDir = resolve(config.siteRepoPath, ADMIN_IMAGE_DIR);
  const absolutePath = resolve(config.siteRepoPath, image.repoRelativePath);
  mkdirSync(outputDir, { recursive: true });
  try {
    // The HTTPS service runs as root, while AGY runs as the repository owner.
    // Keep both the managed directory and asset accessible to the agent.
    giveToRepositoryOwner(outputDir);
    copyFileSync(image.absolutePath, absolutePath, constants.COPYFILE_EXCL);
    giveToRepositoryOwner(absolutePath);
    rmSync(image.tempDirectory, { recursive: true, force: true });
  } catch (err) {
    try { unlinkSync(absolutePath); } catch {}
    rmSync(image.tempDirectory, { recursive: true, force: true });
    throw err;
  }
  return { ...image, absolutePath, tempDirectory: undefined };
}

export function discardPreparedImage(image: PreparedWebsiteImage): void {
  if (image.tempDirectory) {
    rmSync(image.tempDirectory, { recursive: true, force: true });
    return;
  }
  cleanupPreparedImages([image.repoRelativePath]);
}

export function cleanupPreparedImages(paths: readonly string[]): void {
  const allowedRoot = resolve(config.siteRepoPath, ADMIN_IMAGE_DIR) + sep;
  for (const repoRelativePath of paths) {
    const absolutePath = resolve(config.siteRepoPath, repoRelativePath);
    if (!absolutePath.startsWith(allowedRoot) || !absolutePath.endsWith('.webp')) {
      console.warn(`[media] Refused to remove path outside managed image directory: ${repoRelativePath}`);
      continue;
    }
    try {
      unlinkSync(absolutePath);
      console.log(`[media] Removed uncommitted image: ${repoRelativePath}`);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') console.error(`[media] Failed to remove ${repoRelativePath}:`, err);
    }
  }
}
