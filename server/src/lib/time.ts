/**
 * India has no DST, so IST is always UTC+05:30. Doing the offset arithmetic
 * by hand keeps us independent of the server's timezone (Render runs in UTC).
 */
const IST_OFFSET_MS = 330 * 60 * 1000;

/** "YYYY-MM-DD" for the IST calendar day containing `at`. */
export function istDateString(at: Date = new Date()): string {
  return new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant at which the given IST calendar day starts. */
export function istDayStart(date: string): Date {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) - IST_OFFSET_MS);
}

/** Adds whole days to a "YYYY-MM-DD" string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday of the IST week containing `at`, as "YYYY-MM-DD". */
export function istWeekStart(at: Date = new Date()): string {
  const today = istDateString(at);
  const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
  const sinceMonday = (weekday + 6) % 7;
  return addDays(today, -sinceMonday);
}
