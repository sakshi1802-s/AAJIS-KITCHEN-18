import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * Password hashing with scrypt, which ships with Node — no native build step,
 * and it is deliberately slow and memory-hard, so a stolen database is
 * expensive to attack.
 *
 * Stored as "scrypt:<salt hex>:<hash hex>" so the format can change later
 * without guessing what an old row used.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(plain.normalize("NFKC"), salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

/** Constant-time check. Returns false for accounts that have no password. */
export async function verifyPassword(plain: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;

  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(plain.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length)) as Buffer;

  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
