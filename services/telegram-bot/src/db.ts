/**
 * SQLite database singleton.
 * Opens (or creates) the DB file, enables WAL mode, creates tables.
 * All operations are synchronous — no async needed.
 *
 * Schema:
 *   messages — persistent conversation history per chat
 *   authorized_users — Telegram users self-authorized through allowed phone contacts
 */
import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.ts';

// Ensure parent directory exists (e.g. "data/" from "data/bot.db")
const dir = dirname(config.dbPath);
if (dir && dir !== '.') {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(config.dbPath);

// WAL mode: faster writes, better read concurrency
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Schema — idempotent
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id    INTEGER NOT NULL,
    role       TEXT    NOT NULL CHECK (role IN ('user', 'assistant')),
    text       TEXT    NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_chat
    ON messages (chat_id, created_at);

  CREATE TABLE IF NOT EXISTS authorized_users (
    user_id       INTEGER PRIMARY KEY,
    phone         TEXT    NOT NULL,
    first_name    TEXT,
    last_name     TEXT,
    authorized_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_authorized_users_phone
    ON authorized_users (phone);
`);

console.log(`[db] SQLite opened: ${config.dbPath}`);

export default db;
