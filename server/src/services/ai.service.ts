/**
 * "Plan my order" — one Gemini call, no chains, no agents, no vector database.
 *
 * The interesting part is not the call, it's the three things that stop a
 * language model inventing dishes Aji doesn't make or prices she didn't set:
 *
 *   1. the prompt is given the exact list of dish ids it may choose from
 *   2. the reply is schema-validated, then every id not in that list is dropped
 *   3. prices are recomputed from the database — the model never sets a price
 *
 * And when the call fails, times out or comes back as nonsense, a deterministic
 * tag-match takes over. The feature never blocks an order; the menu is always
 * right there.
 */
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { AiSuggestResponse, AiSuggestedLine, MenuItemDTO } from "@shared/api";
import { env, isDev } from "../config/env";
import { logger } from "../lib/logger";
import { MenuItem, toMenuItemDTO } from "../models/MenuItem";

const TIMEOUT_MS = 10_000;
const MAX_LINES = 8;

/** What we allow the model to return. Anything else is a parse failure. */
const ModelReply = z.object({
  summary: z.string().max(300).optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().positive().max(500),
        reason: z.string().max(160).optional(),
      }),
    )
    .max(20),
});

let client: GoogleGenAI | undefined;
const genai = () => (client ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }));

export async function suggestCart(text: string): Promise<AiSuggestResponse> {
  // Only dishes a customer could actually order right now.
  const docs = await MenuItem.find({ isDeleted: false, isAvailable: true }).lean();
  const menu = docs.filter((item) => item.stockCount === null || item.stockCount > 0).map(toMenuItemDTO);

  if (menu.length === 0) {
    return { source: "fallback", summary: "Nothing is available right now.", items: [], total: 0 };
  }

  if (env.GEMINI_API_KEY) {
    try {
      const reply = await askGemini(text, menu);
      const lines = buildLines(reply.items, menu);
      if (lines.length > 0) {
        return {
          source: "ai",
          summary: reply.summary?.trim() || defaultSummary(lines),
          items: lines,
          total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
        };
      }
      logger.warn("AI suggestion had no usable dishes after filtering; falling back");
    } catch (err) {
      logger.warn("AI suggestion failed; falling back", err);
    }
  }

  return fallbackSuggestion(text, menu);
}

// ── The model call ───────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You help customers of a small Maharashtrian home-catering kitchen plan an order.

Rules you must follow:
- Choose ONLY dishes from the supplied menu, and refer to them by their exact "id".
- Never invent a dish, a price or an id.
- Use servesApprox and the guest count to judge quantities, and never go below minQuantity.
- Respect stockLeft when it is a number.
- Prefer a sensible spread for the occasion (something savoury, something sweet, a main if it is a meal).
- Pick at most 6 dishes.
- Reply with JSON only.`;

async function askGemini(text: string, menu: MenuItemDTO[]) {
  const menuForPrompt = menu.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    unitLabel: item.unitLabel,
    servesApprox: item.servesApprox,
    minQuantity: item.minQuantity,
    isVeg: item.isVeg,
    tags: item.tags,
    stockLeft: item.stockCount,
  }));

  const prompt = `Menu (JSON):\n${JSON.stringify(menuForPrompt)}\n\nWhat the customer said:\n"""${text}"""`;
  if (isDev) logger.debug("AI prompt", prompt);

  const response = await genai().models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        required: ["items"],
        properties: {
          summary: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "quantity"],
              properties: {
                id: { type: "string" },
                quantity: { type: "number" },
                reason: { type: "string" },
              },
            },
          },
        },
      },
    },
  });

  const raw = response.text ?? "";
  if (isDev) logger.debug("AI raw response", raw);

  // Unparseable JSON throws here and lands in the fallback.
  return ModelReply.parse(JSON.parse(raw));
}

/**
 * The filter that makes the feature defensible: ids the model made up are
 * dropped, quantities are clamped to what Aji actually allows and has, and
 * every price comes from the database row, not the model.
 */
function buildLines(suggested: { id: string; quantity: number; reason?: string }[], menu: MenuItemDTO[]) {
  const byId = new Map(menu.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const lines: AiSuggestedLine[] = [];

  for (const suggestion of suggested) {
    const item = byId.get(suggestion.id);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);

    const quantity = clampQuantity(Math.round(suggestion.quantity), item);
    if (quantity === 0) continue;

    lines.push({
      item,
      quantity,
      reason: suggestion.reason?.trim() || "",
      lineTotal: item.price * quantity,
    });
    if (lines.length === MAX_LINES) break;
  }
  return lines;
}

function clampQuantity(quantity: number, item: MenuItemDTO): number {
  const wanted = Math.max(Number.isFinite(quantity) ? quantity : 0, item.minQuantity);
  if (item.stockCount === null) return wanted;
  // A fixed batch that can't even cover the minimum order is no use here.
  return item.stockCount >= item.minQuantity ? Math.min(wanted, item.stockCount) : 0;
}

const defaultSummary = (lines: AiSuggestedLine[]) =>
  `A suggested spread of ${lines.length} ${lines.length === 1 ? "dish" : "dishes"}. Change anything you like before ordering.`;

// ── The deterministic fallback ───────────────────────────────────────────

const KEYWORD_TAGS: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /\b(sweet|meetha|god|dessert|goad)\b/i, tags: ["sweet"] },
  { pattern: /\b(upvas|fast|fasting|vrat|ekadashi)\b/i, tags: ["upvas"] },
  { pattern: /\b(breakfast|nashta|nashtha|morning)\b/i, tags: ["breakfast"] },
  { pattern: /\b(snack|chai|tea|evening|faral)\b/i, tags: ["snack", "tea-time"] },
  {
    pattern: /\b(haldi|wedding|lagna|puja|pooja|festive|festival|ganpati|diwali|celebration)\b/i,
    tags: ["festive", "wedding", "puja"],
  },
  { pattern: /\b(lunch|dinner|jevan|meal|thali)\b/i, tags: ["meal"] },
  // Devanagari has no \b word boundary, so these match as plain substrings.
  { pattern: /(गोड|मिठाई)/, tags: ["sweet"] },
  { pattern: /(उपवास)/, tags: ["upvas"] },
  { pattern: /(न्याहारी|नाश्ता)/, tags: ["breakfast"] },
  { pattern: /(हळद|लग्न|पूजा|सण)/, tags: ["festive", "wedding", "puja"] },
  { pattern: /(जेवण|थाळी)/, tags: ["meal"] },
  { pattern: /\b(spicy|tikhat)\b/i, tags: ["spicy"] },
];

/** Pull a guest count out of "60 log", "for 25 people", "25 guests". */
function guessGuests(text: string): number {
  const match = /(\d{1,4})\s*(log|लोक|people|guests|pax|persons?|jan|माणसे)?/i.exec(text);
  const n = match ? Number(match[1]) : NaN;
  return Number.isFinite(n) && n > 0 && n <= 2000 ? n : 10;
}

/**
 * No model involved: match the words we recognise against tags and
 * categories, then pick a small spread. Used whenever Gemini is unavailable,
 * slow, or returns something we can't use.
 */
export function fallbackSuggestion(text: string, menu: MenuItemDTO[]): AiSuggestResponse {
  const guests = guessGuests(text);
  const vegOnly = /\bveg\b/i.test(text) && !/non[-\s]?veg/i.test(text);

  const wanted = new Set(KEYWORD_TAGS.filter(({ pattern }) => pattern.test(text)).flatMap(({ tags }) => tags));
  const pool = vegOnly ? menu.filter((item) => item.isVeg) : menu;

  const scored = pool
    .map((item) => {
      const haystack = [...item.tags, item.category];
      const matches = [...wanted].filter((tag) => haystack.includes(tag)).length;
      return { item, score: matches };
    })
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  // One dish per category, best match first, so the spread isn't four sweets.
  const chosen: MenuItemDTO[] = [];
  const usedCategories = new Set<string>();
  for (const { item, score } of scored) {
    if (chosen.length >= 4) break;
    if (usedCategories.has(item.category)) continue;
    if (wanted.size > 0 && score === 0 && chosen.length > 0) continue;
    usedCategories.add(item.category);
    chosen.push(item);
  }

  const items = chosen
    .map((item) => {
      const quantity = clampQuantity(Math.ceil(guests / item.servesApprox), item);
      return { item, quantity, reason: `About right for ${guests} people.`, lineTotal: item.price * quantity };
    })
    .filter((line) => line.quantity > 0);

  return {
    source: "fallback",
    summary:
      items.length > 0
        ? `A simple spread for about ${guests} people. Adjust anything before you order.`
        : "Couldn't put a spread together — have a look at the menu instead.",
    items,
    total: items.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}
