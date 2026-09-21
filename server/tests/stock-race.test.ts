/**
 * The concurrency proof (roadmap Phase 3 gate).
 *
 * Read-then-write would let several customers each read "1 left", each decide
 * that's enough, and each write 0 — overselling. The single conditional update
 * in order.service.ts makes exactly one of them win.
 */
import request from "supertest";
import { describe, expect, it } from "vitest";
import type { OrderDTO } from "@shared/api";
import { createApp } from "../src/app";
import { MenuItem } from "../src/models/MenuItem";
import { makeMenuItem } from "./factories";
import { makeUser, sessionCookie } from "./helpers/session";

const app = createApp();

const tomorrow = () => new Date(Date.now() + 36 * 60 * 60 * 1000 + 330 * 60 * 1000).toISOString().slice(0, 10);

const order = (menuItemId: string, quantity: number, expectedPrice: number) => ({
  items: [{ menuItemId, quantity, expectedPrice }],
  requestedFor: { date: tomorrow(), slot: "morning" as const },
  deliveryAddress: { label: "Home", line1: "Flat 3, Shanti Nivas", line2: "", city: "Pune", pincode: "411004" },
  customerPhone: "9876543210",
  customerNotes: "",
});

describe("two customers, the last unit", () => {
  it("only one of ten concurrent orders for the last box succeeds", async () => {
    const item = await makeMenuItem({ name: "Diwali Faral Box", price: 65000, stockCount: 1, minQuantity: 1 });
    const users = await Promise.all(Array.from({ length: 10 }, () => makeUser()));

    // All ten fire at once, before any of them has committed.
    const responses = await Promise.all(
      users.map((user) =>
        request(app).post("/api/orders").set("Cookie", sessionCookie(user)).send(order(item.id, 1, 65000)),
      ),
    );

    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(9);

    // Never below zero, and the nine losers were told why.
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(0);
    const losers = responses.filter((r) => r.status === 409);
    for (const loser of losers) {
      expect(loser.body.error.code).toBe("CART_CONFLICT");
    }
  });

  it("concurrent orders for three units of a batch of five let two through, not three", async () => {
    const item = await makeMenuItem({ name: "Ukadiche Modak", price: 3000, stockCount: 5, minQuantity: 1 });
    const users = await Promise.all(Array.from({ length: 3 }, () => makeUser()));

    const responses = await Promise.all(
      users.map((user) =>
        request(app).post("/api/orders").set("Cookie", sessionCookie(user)).send(order(item.id, 3, 3000)),
      ),
    );

    expect(responses.filter((r) => r.status === 201)).toHaveLength(1);
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(2);
  });

  it("unlimited dishes never block each other and stay null", async () => {
    const item = await makeMenuItem({ name: "Kanda Pohe", price: 4000, stockCount: null, minQuantity: 1 });
    const users = await Promise.all(Array.from({ length: 5 }, () => makeUser()));

    const responses = await Promise.all(
      users.map((user) =>
        request(app).post("/api/orders").set("Cookie", sessionCookie(user)).send(order(item.id, 20, 4000)),
      ),
    );

    expect(responses.every((r) => r.status === 201)).toBe(true);
    // $inc would have thrown on null here; the $cond pipeline leaves it alone.
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBeNull();
  });

  it("cancelling gives the unit back, so the next customer can have it", async () => {
    const first = await makeUser();
    const second = await makeUser();
    const item = await makeMenuItem({ name: "Faral Box", price: 65000, stockCount: 1, minQuantity: 1 });

    const placed = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(first))
      .send(order(item.id, 1, 65000))
      .expect(201);
    await request(app).post("/api/orders").set("Cookie", sessionCookie(second)).send(order(item.id, 1, 65000)).expect(409);

    await request(app)
      .post(`/api/orders/${(placed.body as OrderDTO).id}/cancel`)
      .set("Cookie", sessionCookie(first))
      .expect(200);

    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(1);
    await request(app).post("/api/orders").set("Cookie", sessionCookie(second)).send(order(item.id, 1, 65000)).expect(201);
  });
});
