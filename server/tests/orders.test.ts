import request from "supertest";
import { describe, expect, it } from "vitest";
import type { CartConflictDetails, OrderDTO, OrdersListResponse } from "@shared/api";
import { createApp } from "../src/app";
import { MenuItem } from "../src/models/MenuItem";
import { makeMenuItem } from "./factories";
import { makeUser, sessionCookie } from "./helpers/session";

const app = createApp();

const tomorrow = () => {
  const d = new Date(Date.now() + 36 * 60 * 60 * 1000);
  return new Date(d.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);
};

const orderBody = (items: { menuItemId: string; quantity: number; expectedPrice: number }[]) => ({
  items,
  requestedFor: { date: tomorrow(), slot: "evening" as const },
  deliveryAddress: { label: "Home", line1: "Flat 3, Shanti Nivas", line2: "", city: "Pune", pincode: "411004" },
  customerPhone: "9876543210",
  customerNotes: "kam tikhat please",
});

const conflicts = (body: { error: { details?: unknown } }) => (body.error.details as CartConflictDetails).conflicts;

describe("POST /api/orders", () => {
  it("places an order, snapshots name and price, and takes finite stock", async () => {
    const user = await makeUser();
    const modak = await makeMenuItem({ name: "Ukadiche Modak", price: 3000, stockCount: 21, minQuantity: 11 });
    const pohe = await makeMenuItem({ name: "Kanda Pohe", price: 4000, stockCount: null, minQuantity: 10 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(
        orderBody([
          { menuItemId: modak.id, quantity: 11, expectedPrice: 3000 },
          { menuItemId: pohe.id, quantity: 10, expectedPrice: 4000 },
        ]),
      )
      .expect(201);

    const order = res.body as OrderDTO;
    expect(order.status).toBe("PLACED");
    expect(order.orderNumber).toMatch(/^AK-\d{6}-[A-Z2-9]{4}$/);
    expect(order.totalAmount).toBe(11 * 3000 + 10 * 4000);
    expect(order.items[0]).toMatchObject({ nameSnapshot: "Ukadiche Modak", priceAtOrder: 3000, quantity: 11 });
    expect(order.customerNotes).toBe("kam tikhat please");

    // Finite stock went down; unlimited stayed null.
    expect((await MenuItem.findById(modak.id).lean())!.stockCount).toBe(10);
    expect((await MenuItem.findById(pohe.id).lean())!.stockCount).toBeNull();
  });

  it("a later price change does not rewrite an existing order", async () => {
    const user = await makeUser();
    const item = await makeMenuItem({ name: "Sabudana Vada", price: 6000 });
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(orderBody([{ menuItemId: item.id, quantity: 10, expectedPrice: 6000 }]))
      .expect(201);

    await MenuItem.updateOne({ _id: item.id }, { $set: { price: 8000 } });

    const after = await request(app)
      .get(`/api/orders/${(res.body as OrderDTO).id}`)
      .set("Cookie", sessionCookie(user))
      .expect(200);
    expect((after.body as OrderDTO).items[0]!.priceAtOrder).toBe(6000);
    expect((after.body as OrderDTO).totalAmount).toBe(60000);
  });

  it("409s with a diff when the price moved, and takes no stock", async () => {
    const user = await makeUser();
    const item = await makeMenuItem({ name: "Modak", price: 28000, stockCount: 5 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(orderBody([{ menuItemId: item.id, quantity: 1, expectedPrice: 25000 }]))
      .expect(409);

    expect(res.body.error.code).toBe("CART_CONFLICT");
    expect(conflicts(res.body)).toEqual([
      { kind: "PRICE_CHANGED", menuItemId: item.id, name: "Modak", oldPrice: 25000, newPrice: 28000 },
    ]);
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(5);
  });

  it("409s when a dish sold out or was switched off, reporting what's left", async () => {
    const user = await makeUser();
    const soldOut = await makeMenuItem({ name: "Karanji", price: 2000, stockCount: 2 });
    const off = await makeMenuItem({ name: "Bharli Vangi", price: 40000, isAvailable: false });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(
        orderBody([
          { menuItemId: soldOut.id, quantity: 12, expectedPrice: 2000 },
          { menuItemId: off.id, quantity: 1, expectedPrice: 40000 },
        ]),
      )
      .expect(409);

    expect(conflicts(res.body)).toEqual(
      expect.arrayContaining([
        { kind: "INSUFFICIENT_STOCK", menuItemId: soldOut.id, name: "Karanji", requested: 12, available: 2 },
        { kind: "UNAVAILABLE", menuItemId: off.id, name: "Bharli Vangi" },
      ]),
    );
  });

  it("reports every problem at once, not just the first", async () => {
    const user = await makeUser();
    const a = await makeMenuItem({ name: "A", price: 1000, stockCount: 1 });
    const b = await makeMenuItem({ name: "B", price: 2000, isAvailable: false });
    const c = await makeMenuItem({ name: "C", price: 3000, minQuantity: 10 });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(
        orderBody([
          { menuItemId: a.id, quantity: 5, expectedPrice: 900 },
          { menuItemId: b.id, quantity: 1, expectedPrice: 2000 },
          { menuItemId: c.id, quantity: 2, expectedPrice: 3000 },
        ]),
      )
      .expect(409);

    const kinds = conflicts(res.body).map((c) => c.kind);
    expect(kinds).toContain("INSUFFICIENT_STOCK");
    expect(kinds).toContain("PRICE_CHANGED");
    expect(kinds).toContain("UNAVAILABLE");
    expect(kinds).toContain("BELOW_MINIMUM");
  });

  it("409s for a deleted dish", async () => {
    const user = await makeUser();
    const item = await makeMenuItem({ price: 1000 });
    await MenuItem.updateOne({ _id: item.id }, { $set: { isDeleted: true } });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(user))
      .send(orderBody([{ menuItemId: item.id, quantity: 1, expectedPrice: 1000 }]))
      .expect(409);
    expect(conflicts(res.body)[0]!.kind).toBe("NOT_FOUND");
  });

  it("rolls back stock taken for earlier lines when a later line fails", async () => {
    const user = await makeUser();
    const good = await makeMenuItem({ name: "Chakli", price: 48000, stockCount: 10 });
    const bad = await makeMenuItem({ name: "Ladoo", price: 2500, stockCount: 10 });

    // Both pass the first check; `bad` is emptied before the commit runs.
    const body = orderBody([
      { menuItemId: good.id, quantity: 2, expectedPrice: 48000 },
      { menuItemId: bad.id, quantity: 4, expectedPrice: 2500 },
    ]);
    const pending = request(app).post("/api/orders").set("Cookie", sessionCookie(user)).send(body);
    await MenuItem.updateOne({ _id: bad.id }, { $set: { stockCount: 0 } });
    const res = await pending;

    expect(res.status).toBe(409);
    expect((await MenuItem.findById(good.id).lean())!.stockCount).toBe(10);
  });

  it("validates the request: empty cart, duplicate dish, past date, bad phone", async () => {
    const user = await makeUser();
    const cookie = sessionCookie(user);
    const item = await makeMenuItem({ price: 1000 });
    const line = { menuItemId: item.id, quantity: 1, expectedPrice: 1000 };

    const empty = await request(app).post("/api/orders").set("Cookie", cookie).send(orderBody([])).expect(400);
    expect(empty.body.error.message).toMatch(/cart is empty/i);

    await request(app).post("/api/orders").set("Cookie", cookie).send(orderBody([line, line])).expect(400);

    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ...orderBody([line]), requestedFor: { date: "2020-01-01", slot: "morning" } })
      .expect(400);

    await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ...orderBody([line]), customerPhone: "123" })
      .expect(400);
  });

  it("401s when signed out", async () => {
    const item = await makeMenuItem({ price: 1000 });
    await request(app)
      .post("/api/orders")
      .send(orderBody([{ menuItemId: item.id, quantity: 1, expectedPrice: 1000 }]))
      .expect(401);
  });
});

describe("reading orders", () => {
  it("GET /api/orders/me returns only my orders, newest first", async () => {
    const mine = await makeUser();
    const other = await makeUser();
    const item = await makeMenuItem({ price: 1000 });
    const line = { menuItemId: item.id, quantity: 1, expectedPrice: 1000 };

    await request(app).post("/api/orders").set("Cookie", sessionCookie(mine)).send(orderBody([line])).expect(201);
    await request(app).post("/api/orders").set("Cookie", sessionCookie(mine)).send(orderBody([line])).expect(201);
    await request(app).post("/api/orders").set("Cookie", sessionCookie(other)).send(orderBody([line])).expect(201);

    const res = await request(app).get("/api/orders/me").set("Cookie", sessionCookie(mine)).expect(200);
    const orders = (res.body as OrdersListResponse).orders;
    expect(orders).toHaveLength(2);
    expect(new Date(orders[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(orders[1]!.createdAt).getTime());
  });

  it("someone else's order is a 404, and so is a nonexistent one", async () => {
    const owner = await makeUser();
    const nosey = await makeUser();
    const item = await makeMenuItem({ price: 1000 });
    const created = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(owner))
      .send(orderBody([{ menuItemId: item.id, quantity: 1, expectedPrice: 1000 }]))
      .expect(201);

    await request(app)
      .get(`/api/orders/${(created.body as OrderDTO).id}`)
      .set("Cookie", sessionCookie(nosey))
      .expect(404);
    await request(app).get("/api/orders/64b000000000000000000000").set("Cookie", sessionCookie(nosey)).expect(404);
  });

  it("Aji can read any order, and sees who it's from", async () => {
    const customer = await makeUser({ name: "Asha" });
    const aji = await makeUser({ role: "owner" });
    const item = await makeMenuItem({ price: 1000 });
    const created = await request(app)
      .post("/api/orders")
      .set("Cookie", sessionCookie(customer))
      .send(orderBody([{ menuItemId: item.id, quantity: 1, expectedPrice: 1000 }]))
      .expect(201);

    const res = await request(app)
      .get(`/api/orders/${(created.body as OrderDTO).id}`)
      .set("Cookie", sessionCookie(aji))
      .expect(200);
    expect((res.body as OrderDTO).customer?.name).toBe("Asha");
  });
});
