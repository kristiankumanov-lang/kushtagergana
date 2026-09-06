import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db/client";

export const SESSION_TTL_HOURS = 12;
export const SESSION_COOKIE_NAME = "guesthouse_session";

export type UserRole = "waiter" | "kitchen";

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface SessionToken {
  /** Goes only into the cookie. Never logged or persisted. */
  raw: string;
  /** SHA-256 hex digest — this is what's persisted and looked up. */
  hash: string;
  expiresAt: Date;
}

export function generateSessionToken(): SessionToken {
  const raw = randomBytes(32).toString("base64url");
  return {
    raw,
    hash: hashSessionToken(raw),
    expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000),
  };
}

export function hashSessionToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex, ...extra] = storedHash.split(":");
  if (!saltHex || !hashHex || extra.length > 0) return false;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    if (salt.length !== 16 || expected.length !== 64) return false;
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function authenticateUser(username: string, password: string): Promise<SessionUser | null> {
  const sql = getSql();
  const [row] = await sql<(SessionUser & { password_hash: string })[]>`
    select id, username, role, password_hash
    from guesthouse.users
    where username = ${username}
    limit 1
  `;
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, username: row.username, role: row.role };
}

export async function createSession(userId: string): Promise<string> {
  const sql = getSql();
  const token = generateSessionToken();
  await sql`
    insert into guesthouse.sessions (user_id, token_hash, expires_at)
    values (${userId}, ${token.hash}, ${token.expiresAt})
  `;
  return token.raw;
}

export async function getSessionUser(rawToken: string): Promise<SessionUser | null> {
  const sql = getSql();
  const [user] = await sql<SessionUser[]>`
    select users.id, users.username, users.role
    from guesthouse.sessions as sessions
    join guesthouse.users as users on users.id = sessions.user_id
    where sessions.token_hash = ${hashSessionToken(rawToken)}
      and sessions.expires_at > now()
    limit 1
  `;
  return user ?? null;
}

export async function destroySession(rawToken: string): Promise<void> {
  const sql = getSql();
  await sql`
    delete from guesthouse.sessions
    where token_hash = ${hashSessionToken(rawToken)}
  `;
}
