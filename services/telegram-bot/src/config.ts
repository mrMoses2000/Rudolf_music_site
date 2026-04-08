function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function parseAllowedUsers(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const n = parseInt(s, 10);
      if (isNaN(n)) throw new Error(`TELEGRAM_ALLOWED_USERS: "${s}" is not a valid numeric user ID`);
      return n;
    });
}

export const config = {
  // ── Telegram ──────────────────────────────────────────────
  botToken: requireEnv('TELEGRAM_BOT_TOKEN'),
  webhookSecret: requireEnv('TELEGRAM_WEBHOOK_SECRET'),
  allowedUsers: parseAllowedUsers(optionalEnv('TELEGRAM_ALLOWED_USERS', '')),

  // ── Gemini CLI ────────────────────────────────────────────
  geminiModel: optionalEnv('GEMINI_MODEL', 'gemini-3-flash-preview'),
  /** ms before Gemini CLI child process is killed */
  geminiTimeoutMs: parseInt(optionalEnv('GEMINI_TIMEOUT_MS', '120000'), 10),

  // ── HTTPS server ──────────────────────────────────────────
  port: parseInt(optionalEnv('BOT_PORT', '8443'), 10),
  host: optionalEnv('BOT_HOST', '0.0.0.0'),
  sslCert: optionalEnv('SSL_CERT', '/etc/letsencrypt/live/musikschule-cms-bielefeld.de/fullchain.pem'),
  sslKey: optionalEnv('SSL_KEY', '/etc/letsencrypt/live/musikschule-cms-bielefeld.de/privkey.pem'),

  // ── Site ──────────────────────────────────────────────────
  siteRepoPath: requireEnv('SITE_REPO_PATH'),
  contentFile: optionalEnv('SITE_CONTENT_FILE', 'site/src/data/content.js'),

  // ── UX ───────────────────────────────────────────────────
  /** ms user has to confirm/cancel before auto-rollback */
  confirmTimeoutMs: parseInt(optionalEnv('CONFIRM_TIMEOUT_MS', '300000'), 10),
} as const;
