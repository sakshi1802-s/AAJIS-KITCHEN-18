import { randomInt } from "node:crypto";
import { istDateString } from "./time";

// No I, O, 0 or 1 — Aji reads these numbers aloud over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * "AK-260918-7Q3F" — the IST date plus four random characters.
 *
 * Random rather than sequential so we don't need a counters collection just to
 * hand out numbers. The unique index on orderNumber is the real guarantee;
 * the caller retries on the (vanishingly rare) collision.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const date = istDateString(now).slice(2).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 4; i += 1) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `AK-${date}-${suffix}`;
}
