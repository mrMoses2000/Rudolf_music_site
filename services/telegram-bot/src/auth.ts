import { config, normalizePhone } from './config.ts';
import db from './db.ts';
import type { TelegramContact } from './types.ts';

const stmtHasAuthorizedUser = db.prepare(
  'SELECT 1 FROM authorized_users WHERE user_id = ? LIMIT 1',
);

const stmtUpsertAuthorizedUser = db.prepare(`
  INSERT INTO authorized_users (user_id, phone, first_name, last_name, authorized_at)
  VALUES (@userId, @phone, @firstName, @lastName, @authorizedAt)
  ON CONFLICT(user_id) DO UPDATE SET
    phone = excluded.phone,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    authorized_at = excluded.authorized_at
`);

export type ContactAuthorizationResult =
  | { ok: true; phone: string }
  | { ok: false; reason: 'contact_not_self' | 'phone_not_allowed'; phone: string };

export function isUserAuthorized(userId: number): boolean {
  if (config.allowedUsers.includes(userId)) return true;
  return Boolean(stmtHasAuthorizedUser.get(userId));
}

export function authorizeFromContact(userId: number, contact: TelegramContact): ContactAuthorizationResult {
  const phone = normalizePhone(contact.phone_number);

  if (contact.user_id !== userId) {
    return { ok: false, reason: 'contact_not_self', phone };
  }

  if (!config.allowedPhones.includes(phone)) {
    return { ok: false, reason: 'phone_not_allowed', phone };
  }

  stmtUpsertAuthorizedUser.run({
    userId,
    phone,
    firstName: contact.first_name || null,
    lastName: contact.last_name || null,
    authorizedAt: Date.now(),
  });

  return { ok: true, phone };
}
