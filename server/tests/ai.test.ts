import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AiSuggestResponse } from "@shared/api";
import { MenuItem } from "../src/models/MenuItem";
import { makeMenuItem } from "./factories";
import { makeUser, sessionCookie } from "./helpers/session";

// Stand in for Gemini.
const generateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const { createApp } = await import("../src/app");
const { env } = await import("../src/config/env");
const app = createApp();

const reply = (payload: unknown) => ({ text: JSON.stringify(payload) });

async function seedMenu() {
  await MenuItem.deleteMany({});
  const modak = await makeMenuItem({
    name: "Ukadiche Modak",
    category: "faral",
    price: 3000,
    minQuantity: 11,
    servesApprox: 1,
    stockCount: 21,
    tags: ["sweet", "festive", "ganpati"],
  });
  const bhat = await makeMenuItem({
    name: "Masale Bhat",
    category: "thali-veg",
    price: 36000,
    minQuantity: 2,
    servesApprox: 5,
    tags: ["meal", "festive", "haldi"],
  });
  const vada = await makeMenuItem({
    name: "Sabudana Vada",
    category: "snacks",
    price: 6000,
    minQuantity: 10,
    servesApprox: 1,
    tags: ["upvas", "snack"],
  });
  const chicken = await makeMenuItem({
    name: "Chicken Rassa",
    category: "thali-nonveg",
    price: 90000,
    minQuantity: 1,
    servesApprox: 5,
    isVeg: false,
    tags: ["meal", "spicy"],
  });
  return { modak, bhat, vada, chicken };
}

describe("POST /api/ai/suggest", () => {
  beforeEach(async () => {
    await seedMenu();
    generateContent.mockReset();
    Object.assign(env, { GEMINI_API_KEY: "test-key" });
  });

  afterEach(() => {
    Object.assign(env, { GEMINI_API_KEY: "" });
  });

  it("returns the model's dishes with prices computed server-side", async () => {
    const { modak, bhat } = await seedMenu();
    generateContent.mockResolvedValue(
      reply({
        summary: "A haldi spread",
        items: [
          { id: modak.id, quantity: 60, reason: "Everyone expects modak" },
          { id: bhat.id, quantity: 12, reason: "The main rice" },
        ],
      }),
    );

    const user = await makeUser();
    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "haldi at home, 60 log, mostly veg, kuch sweet bhi chahiye" })
      .expect(200);

    const body = res.body as AiSuggestResponse;
    expect(body.source).toBe("ai");
    expect(body.items).toHaveLength(2);
    // Only 21 modak exist today, so the model's 60 is cut down to what's there.
    expect(body.items[0]).toMatchObject({ quantity: 21, lineTotal: 21 * 3000 });
    expect(body.items[1]).toMatchObject({ quantity: 12, lineTotal: 12 * 36000 });
    expect(body.total).toBe(21 * 3000 + 12 * 36000);
  });

  it("drops ids the model invented", async () => {
    const { modak } = await seedMenu();
    generateContent.mockResolvedValue(
      reply({
        items: [
          { id: "64b000000000000000000000", quantity: 4, reason: "Butter chicken pizza" },
          { id: "not-even-an-id", quantity: 2 },
          { id: modak.id, quantity: 21 },
        ],
      }),
    );

    const user = await makeUser();
    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "ganpati at home" })
      .expect(200);

    const body = res.body as AiSuggestResponse;
    expect(body.items).toHaveLength(1);
    expect(body.items[0]!.item.name).toBe("Ukadiche Modak");
  });

  it("clamps quantities to the minimum order and the remaining stock", async () => {
    const { modak } = await seedMenu(); // min 11, stock 21
    generateContent.mockResolvedValue(reply({ items: [{ id: modak.id, quantity: 2 }] }));
    const user = await makeUser();

    const low = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "small ganpati puja" })
      .expect(200);
    expect((low.body as AiSuggestResponse).items[0]!.quantity).toBe(11);

    generateContent.mockResolvedValue(reply({ items: [{ id: modak.id, quantity: 500 }] }));
    const high = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "huge ganpati puja" })
      .expect(200);
    expect((high.body as AiSuggestResponse).items[0]!.quantity).toBe(21);
  });

  it("falls back when the model returns unparseable JSON", async () => {
    generateContent.mockResolvedValue({ text: "Sure! Here's a nice spread: pohe and modak." });
    const user = await makeUser();

    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "breakfast for 20 people" })
      .expect(200);

    const body = res.body as AiSuggestResponse;
    expect(body.source).toBe("fallback");
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("falls back when the model call throws or times out", async () => {
    generateContent.mockRejectedValue(new Error("The operation was aborted"));
    const user = await makeUser();

    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "upvas food for 12 people" })
      .expect(200);

    expect((res.body as AiSuggestResponse).source).toBe("fallback");
  });

  it("falls back — without calling Gemini — when no API key is configured", async () => {
    Object.assign(env, { GEMINI_API_KEY: "" });
    const user = await makeUser();

    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "sweet dishes for 30 guests" })
      .expect(200);

    expect((res.body as AiSuggestResponse).source).toBe("fallback");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("the fallback reads the guest count, honours veg-only, and prices from the database", async () => {
    Object.assign(env, { GEMINI_API_KEY: "" });
    const user = await makeUser();

    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "haldi function, 60 log, veg only please" })
      .expect(200);

    const body = res.body as AiSuggestResponse;
    expect(body.items.every((line) => line.item.isVeg)).toBe(true);
    expect(body.summary).toMatch(/60 people/);
    for (const line of body.items) {
      expect(line.lineTotal).toBe(line.item.price * line.quantity);
      expect(line.quantity).toBeGreaterThanOrEqual(line.item.minQuantity);
    }
  });

  it("never suggests a dish that is switched off or sold out", async () => {
    const { modak } = await seedMenu();
    await MenuItem.updateOne({ _id: modak.id }, { $set: { stockCount: 0 } });
    await MenuItem.updateMany({ name: "Masale Bhat" }, { $set: { isAvailable: false } });
    generateContent.mockResolvedValue(reply({ items: [{ id: modak.id, quantity: 11 }] }));

    const user = await makeUser();
    const res = await request(app)
      .post("/api/ai/suggest")
      .set("Cookie", sessionCookie(user))
      .send({ text: "ganpati sweets" })
      .expect(200);

    const body = res.body as AiSuggestResponse;
    const names = body.items.map((line) => line.item.name);
    expect(names).not.toContain("Ukadiche Modak");
    expect(names).not.toContain("Masale Bhat");
  });

  it("needs a signed-in customer and some text", async () => {
    await request(app).post("/api/ai/suggest").send({ text: "anything" }).expect(401);

    const user = await makeUser();
    await request(app).post("/api/ai/suggest").set("Cookie", sessionCookie(user)).send({ text: "hi" }).expect(400);
  });
});
