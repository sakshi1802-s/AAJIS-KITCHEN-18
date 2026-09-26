/**
 * Answers one question: is Gemini actually working?
 *
 *   npm --prefix server run check:gemini
 *
 * It reads the key from server/.env the same way the app does, sends a test
 * prompt through the same SDK and the same model the planner uses, and prints
 * what came back. The key is never printed and never leaves the server — it
 * is not in the client bundle at all, because the browser only ever calls our
 * own `POST /api/ai/suggest`.
 */
import { GoogleGenAI } from "@google/genai";
import { env } from "../../src/config/env";

const PROMPT = "Reply with exactly: Gemini is working.";

async function main(): Promise<void> {
  if (!env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is empty in server/.env, so the planner is using its fallback.");
    console.error("Get a key at https://aistudio.google.com/apikey, put it in server/.env, and run this again.");
    process.exitCode = 1;
    return;
  }

  console.log(`Key found (${env.GEMINI_API_KEY.length} characters). Model: ${env.GEMINI_MODEL}`);

  const genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const started = Date.now();

  const response = await genai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: PROMPT,
    config: { abortSignal: AbortSignal.timeout(20_000) },
  });

  console.log(`Gemini replied in ${Date.now() - started}ms:`);
  console.log(`  ${response.text?.trim() ?? "(empty reply)"}`);
}

main().catch((error: unknown) => {
  console.error("Gemini call failed:");
  console.error(error instanceof Error ? error.message : error);
  console.error("\nThe site still works: the planner falls back to a deterministic tag match.");
  process.exitCode = 1;
});
