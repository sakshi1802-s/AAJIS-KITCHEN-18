import { z } from "zod";

// Load server/.env in development. On Render the variables come from the
// dashboard, and tests set their own, so a missing file is not an error.
if (process.env.NODE_ENV !== "test") {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file — fine
  }
}

// Blank lines in .env (KEY=) mean "not set", not "set to an empty string".
const blankToUndefined = (v: unknown) => (v === "" ? undefined : v);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required — paste your Atlas connection string into server/.env"),
  CLIENT_ORIGIN: z.preprocess(blankToUndefined, z.url().default("http://localhost:5173")),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  // Aji's Google account email — the only user who gets role "owner".
  OWNER_EMAIL: z.preprocess(blankToUndefined, z.email().transform((e) => e.toLowerCase()).optional()),
  GOOGLE_CLIENT_ID: z.string().default(""),

  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.preprocess(blankToUndefined, z.string().default("gemini-3.5-flash-lite")),

  // Optional: no-op until n8n exists (roadmap section 7).
  N8N_WEBHOOK_URL: z.preprocess(blankToUndefined, z.url().optional()),
  N8N_SECRET: z.string().default(""),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable list instead of a crash deep inside a request.
  console.error("✖ Invalid server environment:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
