import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { MenuItemDTO, OrderDTO, OrdersListResponse, OwnerStatsDTO } from "@shared/api";
import { createApp } from "../src/app";
import { MenuItem } from "../src/models/MenuItem";
import { Order } from "../src/models/Order";
import { makeMenuItem } from "./factories";
import { makeUser, sessionCookie, kitchenCookie } from "./helpers/session";

const app = createApp();

const tomorrow = () => new Date(Date.now() + 36 * 60 * 60 * 1000 + 330 * 60 * 1000).toISOString().slice(0, 10);

async function placeOrder(overrides: { quantity?: number; stockCount?: number | null; date?: string } = {}) {
  const customer = await makeUser({ name: "Asha Kore" });
  const item = await makeMenuItem({ price: 3000, stockCount: overrides.stockCount ?? 10, minQuantity: 1 });
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", sessionCookie(customer))
    .send({
      items: [{ menuItemId: item.id, quantity: overrides.quantity ?? 2, expectedPrice: 3000 }],
      requestedFor: { date: overrides.date ?? tomorrow(), slot: "morning" as const },
      deliveryAddress: { label: "Home", line1: "Flat 3, Shanti Nivas", line2: "", city: "Pune", pincode: "411004" },
      customerPhone: "9876543210",
      customerNotes: "",
    })
    .expect(201);
  return { customer, item, order: res.body as OrderDTO };
}

describe("the owner gate", () => {
  it("a customer gets 403 on every owner route; signed out gets 401", async () => {
    const customer = await makeUser();
    // Signed in at the kitchen's own door, but not the kitchen's account.
    const cookie = kitchenCookie(customer);
    // Every admin route, not a sample: the dashboard URL being unlisted is
    // tidiness, and this is the part that actually keeps customers out.
    const id = "64b000000000000000000000";
    const routes: [string, string][] = [
      ["get", "/api/owner/orders"],
      ["get", "/api/owner/stats"],
      ["post", "/api/owner/menu"],
      ["patch", `/api/owner/menu/${id}`],
      ["delete", `/api/owner/menu/${id}`],
      ["patch", `/api/owner/orders/${id}/status`],
    ];

    for (const [method, path] of routes) {
      const asCustomer = await request(app)[method as "get"](path).set("Cookie", cookie).send({});
      expect(asCustomer.status).toBe(403);
      expect(asCustomer.body.error.code).toBe("FORBIDDEN");

      const signedOut = await request(app)[method as "get"](path).send({});
      expect(signedOut.status).toBe(401);
    }
  });

  it("a customer cannot accept their own order through the owner route", async () => {
    const { customer, order } = await placeOrder();
    // A shop session is not a key to the kitchen at all: it isn't the wrong
    // role there, it simply isn't a session there.
    await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", sessionCookie(customer))
      .send({ decision: "ACCEPTED" })
      .expect(401);
    // Even signed in at the kitchen's own door, the role still decides.
    await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", kitchenCookie(customer))
      .send({ decision: "ACCEPTED" })
      .expect(403);
    expect((await Order.findById(order.id).lean())!.status).toBe("PLACED");
  });
});

describe("GET /api/owner/orders", () => {
  it("puts orders needing a decision first and names the customer", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order: waiting } = await placeOrder();
    const { order: decided } = await placeOrder();
    await request(app)
      .patch(`/api/owner/orders/${decided.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "ACCEPTED" })
      .expect(200);

    const res = await request(app).get("/api/owner/orders").set("Cookie", kitchenCookie(aji)).expect(200);
    const orders = (res.body as OrdersListResponse).orders;
    expect(orders[0]!.id).toBe(waiting.id);
    expect(orders[0]!.customer).toMatchObject({ name: "Asha Kore" });
    expect(orders[0]!.customerPhone).toBe("9876543210");
  });

  it("filters by status and by the date the food is wanted", async () => {
    const aji = await makeUser({ role: "owner" });
    const nextWeek = new Date(Date.now() + 7 * 864e5 + 330 * 60 * 1000).toISOString().slice(0, 10);
    const { order: soon } = await placeOrder();
    await placeOrder({ date: nextWeek });

    const byDate = await request(app)
      .get(`/api/owner/orders?date=${soon.requestedFor.date}`)
      .set("Cookie", kitchenCookie(aji))
      .expect(200);
    expect((byDate.body as OrdersListResponse).orders.every((o) => o.requestedFor.date === soon.requestedFor.date)).toBe(
      true,
    );

    const cancelled = await request(app)
      .get("/api/owner/orders?status=CANCELLED")
      .set("Cookie", kitchenCookie(aji))
      .expect(200);
    expect((cancelled.body as OrdersListResponse).orders).toEqual([]);
  });
});

describe("PATCH /api/owner/orders/:id/status", () => {
  it("accepts an order", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order } = await placeOrder();

    const res = await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "ACCEPTED" })
      .expect(200);

    expect((res.body as OrderDTO).status).toBe("ACCEPTED");
    expect((res.body as OrderDTO).decidedAt).not.toBeNull();
  });

  it("declining needs a reason, keeps it, and puts the stock back", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order, item } = await placeOrder({ quantity: 4, stockCount: 10 });
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(6);

    await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "DECLINED" })
      .expect(400);

    const res = await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "DECLINED", reason: "I'm at a wedding that day" })
      .expect(200);

    expect(res.body as OrderDTO).toMatchObject({ status: "DECLINED", ownerNote: "I'm at a wedding that day" });
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(10);
  });

  it("deciding twice is a 409", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order } = await placeOrder();
    const cookie = kitchenCookie(aji);

    await request(app).patch(`/api/owner/orders/${order.id}/status`).set("Cookie", cookie).send({ decision: "ACCEPTED" }).expect(200);
    const second = await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", cookie)
      .send({ decision: "ACCEPTED" })
      .expect(409);
    expect(second.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("rejects a status that isn't a decision", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order } = await placeOrder();
    await request(app)
      .patch(`/api/owner/orders/${order.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "CANCELLED" })
      .expect(400);
  });
});

describe("the menu manager", () => {
  it("creates, edits, toggles availability and sets or clears stock", async () => {
    const aji = await makeUser({ role: "owner" });
    const cookie = kitchenCookie(aji);

    const created = await request(app)
      .post("/api/owner/menu")
      .set("Cookie", cookie)
      .send({
        name: "Sabudana Khichdi",
        nameMarathi: "साबुदाणा खिचडी",
        category: "snacks",
        unitLabel: "per plate",
        price: 6000,
        minQuantity: 10,
        servesApprox: 1,
        tags: ["upvas", "Breakfast"],
      })
      .expect(201);

    const item = created.body as MenuItemDTO;
    expect(item).toMatchObject({ name: "Sabudana Khichdi", price: 6000, stockCount: null, isAvailable: true });
    expect(item.tags).toEqual(["upvas", "breakfast"]); // tags are lowercased

    const off = await request(app)
      .patch(`/api/owner/menu/${item.id}`)
      .set("Cookie", cookie)
      .send({ isAvailable: false, stockCount: 12 })
      .expect(200);
    expect(off.body as MenuItemDTO).toMatchObject({ isAvailable: false, stockCount: 12 });

    const unlimited = await request(app)
      .patch(`/api/owner/menu/${item.id}`)
      .set("Cookie", cookie)
      .send({ stockCount: null })
      .expect(200);
    expect((unlimited.body as MenuItemDTO).stockCount).toBeNull();
  });

  it("a one-field edit leaves every other field alone", async () => {
    const aji = await makeUser({ role: "owner" });
    const cookie = kitchenCookie(aji);
    const item = await makeMenuItem({
      name: "Ukadiche Modak",
      nameMarathi: "उकडीचे मोदक",
      description: "Steamed, with ghee",
      price: 3000,
      minQuantity: 11,
      servesApprox: 2,
      stockCount: 21,
      tags: ["festive", "ganpati"],
    });

    // Flipping the availability switch must not reset anything else — a
    // partial schema carrying defaults would silently blank all of these.
    const res = await request(app)
      .patch(`/api/owner/menu/${item.id}`)
      .set("Cookie", cookie)
      .send({ isAvailable: false })
      .expect(200);

    expect(res.body as MenuItemDTO).toMatchObject({
      isAvailable: false,
      nameMarathi: "उकडीचे मोदक",
      description: "Steamed, with ghee",
      minQuantity: 11,
      servesApprox: 2,
      stockCount: 21,
      tags: ["festive", "ganpati"],
    });
  });

  it("rejects an empty update", async () => {
    const aji = await makeUser({ role: "owner" });
    const item = await makeMenuItem({});
    await request(app).patch(`/api/owner/menu/${item.id}`).set("Cookie", kitchenCookie(aji)).send({}).expect(400);
  });

  it("rejects a dish with no name, a bad category or a fractional price", async () => {
    const aji = await makeUser({ role: "owner" });
    const cookie = kitchenCookie(aji);
    const base = { name: "Test", category: "snacks", unitLabel: "per plate", price: 1000 };

    await request(app).post("/api/owner/menu").set("Cookie", cookie).send({ ...base, name: "" }).expect(400);
    await request(app).post("/api/owner/menu").set("Cookie", cookie).send({ ...base, category: "pizza" }).expect(400);
    await request(app).post("/api/owner/menu").set("Cookie", cookie).send({ ...base, price: 10.5 }).expect(400);
  });

  it("deleting hides the dish from the menu but keeps old orders readable", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order, item } = await placeOrder();

    await request(app).delete(`/api/owner/menu/${item.id}`).set("Cookie", kitchenCookie(aji)).expect(204);

    const menu = await request(app).get("/api/menu").expect(200);
    expect(menu.body.items.some((i: MenuItemDTO) => i.id === item.id)).toBe(false);

    const stillThere = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", sessionCookie(aji))
      .expect(200);
    expect((stillThere.body as OrderDTO).items[0]!.nameSnapshot).toBe(item.name);

    // A second delete is a 404, not a silent success.
    await request(app).delete(`/api/owner/menu/${item.id}`).set("Cookie", kitchenCookie(aji)).expect(404);
  });
});

describe("GET /api/owner/stats", () => {
  beforeEach(async () => {
    await Order.deleteMany({});
  });

  it("counts today's orders, those waiting, and this week's accepted total", async () => {
    const aji = await makeUser({ role: "owner" });
    const { order: first } = await placeOrder({ quantity: 2 }); // 2 × 3000 = 6000
    await placeOrder({ quantity: 1 });

    await request(app)
      .patch(`/api/owner/orders/${first.id}/status`)
      .set("Cookie", kitchenCookie(aji))
      .send({ decision: "ACCEPTED" })
      .expect(200);

    const res = await request(app).get("/api/owner/stats").set("Cookie", kitchenCookie(aji)).expect(200);
    expect(res.body as OwnerStatsDTO).toEqual({ ordersToday: 2, waitingForDecision: 1, weekTotal: 6000 });
  });
});
