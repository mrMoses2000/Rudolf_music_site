/**
 * AssemblyAI voice transcription.
 *
 * Flow: audio Buffer → ffmpeg → MP3 → AssemblyAI upload → submit → poll → text
 * All HTTP via Node built-ins (no external deps).
 */
import https from 'node:https';
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from './config.ts';

const ASSEMBLYAI_HOST = 'api.assemblyai.com';

// ── HTTP helper ───────────────────────────────────────────────────────────────

function apiRequest(
  method: string,
  path: string,
  body?: Buffer | string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const isBinary = body instanceof Buffer;
    const payload = isBinary ? body : body ? Buffer.from(body) : null;

    const req = https.request(
      {
        hostname: ASSEMBLYAI_HOST,
        path,
        method,
        headers: {
          Authorization: config.assemblyAiKey,
          ...(payload && {
            'Content-Type': isBinary ? 'application/octet-stream' : 'application/json',
            'Content-Length': payload.byteLength,
          }),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>);
          } catch {
            reject(new Error('Failed to parse AssemblyAI JSON response'));
          }
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Three-phase pipeline ──────────────────────────────────────────────────────

/** Phase 1: upload raw audio bytes, get a temporary URL back */
async function uploadAudio(buffer: Buffer): Promise<string> {
  const res = await apiRequest('POST', '/v2/upload', buffer);
  if (typeof res.upload_url !== 'string') throw new Error('AssemblyAI upload: missing upload_url');
  return res.upload_url;
}

/** Phase 2: submit transcription job, get a transcript_id */
async function submitJob(uploadUrl: string): Promise<string> {
  const language = config.transcriptionLanguage;
  const body = JSON.stringify({
    audio_url: uploadUrl,
    // Auto-detection or explicit language code
    ...(language === 'auto'
      ? { language_detection: true }
      : { language_code: language }),
    punctuate: true,
    format_text: true,
    speech_model: 'universal',
  });
  const res = await apiRequest('POST', '/v2/transcript', body);
  if (res.error) throw new Error(`AssemblyAI submit: ${res.error}`);
  if (typeof res.id !== 'string') throw new Error('AssemblyAI submit: missing transcript id');
  return res.id;
}

/** Phase 3: poll until completed (max 5 min, 5s interval) */
async function pollJob(transcriptId: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await apiRequest('GET', `/v2/transcript/${transcriptId}`);
    if (res.status === 'completed') return typeof res.text === 'string' ? res.text : '';
    if (res.status === 'error') throw new Error(`AssemblyAI error: ${res.error}`);
    // status: queued | processing — keep polling
  }
  throw new Error('AssemblyAI timed out after 5 minutes');
}

// ── ffmpeg conversion ─────────────────────────────────────────────────────────

function convertToMp3(inputPath: string, outputPath: string): void {
  execSync(
    `${config.ffmpegPath} -y -i "${inputPath}" -ar 16000 -ac 1 -b:a 64k "${outputPath}"`,
    { stdio: 'pipe' },
  );
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Transcribe an audio buffer (any format ffmpeg can decode) to text.
 * @param audioBuffer  Raw audio bytes (e.g. .oga from Telegram voice)
 * @param sourceExt    File extension hint for ffmpeg ('oga', 'mp4', etc.)
 */
export async function transcribeAudio(audioBuffer: Buffer, sourceExt: string): Promise<string> {
  if (!config.assemblyAiKey) {
    throw new Error('ASSEMBLYAI_API_KEY is not configured');
  }

  const ts = Date.now();
  const inputPath = join(tmpdir(), `tgbot_${ts}.${sourceExt}`);
  const mp3Path = join(tmpdir(), `tgbot_${ts}.mp3`);

  try {
    writeFileSync(inputPath, audioBuffer);
    convertToMp3(inputPath, mp3Path);
    const mp3Buffer = readFileSync(mp3Path);

    const uploadUrl = await uploadAudio(mp3Buffer);
    const transcriptId = await submitJob(uploadUrl);
    return await pollJob(transcriptId);
  } finally {
    for (const p of [inputPath, mp3Path]) {
      try { unlinkSync(p); } catch {}
    }
  }
}
