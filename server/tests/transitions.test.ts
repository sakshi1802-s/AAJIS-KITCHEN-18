/** The status allow-map: PLACED → ACCEPTED | DECLINED | CANCELLED, nothing else. */
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderDTO } from "@shared/api";
import { createApp } from "../src/app";
import { MenuItem } from "../src/models/MenuItem";
import { Order } from "../src/models/Order";
import * as orderService from "../src/services/order.service";
import { makeMenuItem } from "./factories";
import { makeUser, sessionCookie } from "./helpers/session";

const app = createApp();

const tomorrow = () => new Date(Date.now() + 36 * 60 * 60 * 1000 + 330 * 60 * 1000).toISOString().slice(0, 10);

async function placeOrder(quantity = 1, stockCount: number | null = 5) {
  const customer = await makeUser();
  const item = await makeMenuItem({ name: "Modak", price: 3000, stockCount, minQuantity: 1 });
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", sessionCookie(customer))
    .send({
      items: [{ menuItemId: item.id, quantity, expectedPrice: 3000 }],
      requestedFor: { date: tomorrow(), slot: "evening" as const },
      deliveryAddress: { label: "Home", line1: "Flat 3, Shanti Nivas", line2: "", city: "Pune", pincode: "411004" },
      customerPhone: "9876543210",
      customerNotes: "",
    })
    .expect(201);
  return { customer, item, order: res.body as OrderDTO };
}

describe("the allow-map", () => {
  it("only the owner can accept, and a customer cannot promote their own order", async () => {
    const { customer, order } = await placeOrder();
    const aji = await makeUser({ role: "owner" });

    await expect(
      orderService.decideOrder(order.id, "ACCEPTED", { id: customer.id, role: "customer" }),
    ).rejects.toMatchObject({ status: 403 });

    const accepted = await orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" });
    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.decidedAt).not.toBeNull();
  });

  it("an accepted order cannot be cancelled, declined or re-accepted", async () => {
    const { customer, order } = await placeOrder();
    const aji = await makeUser({ role: "owner" });
    await orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" });

    await request(app).post(`/api/orders/${order.id}/cancel`).set("Cookie", sessionCookie(customer)).expect(409);
    await expect(
      orderService.decideOrder(order.id, "DECLINED", { id: aji.id, role: "owner" }, "changed my mind"),
    ).rejects.toMatchObject({ status: 409, code: "INVALID_TRANSITION" });
    await expect(
      orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("a customer can cancel only their own order, and only while it's waiting", async () => {
    const { order } = await placeOrder();
    const stranger = await makeUser();

    // Not yours: 404, so the id isn't confirmed.
    await request(app).post(`/api/orders/${order.id}/cancel`).set("Cookie", sessionCookie(stranger)).expect(404);
  });

  it("declining restores stock and records Aji's reason", async () => {
    const { item, order } = await placeOrder(3, 5);
    const aji = await makeUser({ role: "owner" });
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(2);

    const declined = await orderService.decideOrder(order.id, "DECLINED", { id: aji.id, role: "owner" }, "Out of town that day");

    expect(declined.status).toBe("DECLINED");
    expect(declined.ownerNote).toBe("Out of town that day");
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(5);
  });

  it("stock is restored only once when a cancel and a decline race", async () => {
    const { customer, item, order } = await placeOrder(2, 5);
    const aji = await makeUser({ role: "owner" });

    const results = await Promise.allSettled([
      orderService.cancelOrder(order.id, { id: customer.id, role: "customer" }),
      orderService.decideOrder(order.id, "DECLINED", { id: aji.id, role: "owner" }, "Can't manage it"),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBe(5);
  });

  it("unlimited dishes are not 'restored' into a number on decline", async () => {
    const { item, order } = await placeOrder(4, null);
    const aji = await makeUser({ role: "owner" });
    await orderService.decideOrder(order.id, "DECLINED", { id: aji.id, role: "owner" }, "Sorry");
    expect((await MenuItem.findById(item.id).lean())!.stockCount).toBeNull();
  });

  it("the decision schema demands a reason for a decline but not an accept", async () => {
    const { ownerDecisionSchema } = await import("../src/schemas/order.schema");
    expect(ownerDecisionSchema.safeParse({ decision: "ACCEPTED" }).success).toBe(true);
    expect(ownerDecisionSchema.safeParse({ decision: "DECLINED" }).success).toBe(false);
    expect(ownerDecisionSchema.safeParse({ decision: "DECLINED", reason: "Out of town" }).success).toBe(true);
  });
});

describe("the notification seam", () => {
  beforeEach(() => {
    delete process.env.N8N_WEBHOOK_URL;
    vi.unstubAllGlobals();
  });

  it("does nothing when no webhook is configured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { order } = await placeOrder();
    const aji = await makeUser({ role: "owner" });

    await orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("a hanging webhook does not hold up the response", async () => {
    // The module caches env at import time, so poke the parsed config.
    const { env } = await import("../src/config/env");
    const hung = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      () => new Promise<Response>(() => {}),
    );
    vi.stubGlobal("fetch", hung);
    Object.assign(env, { N8N_WEBHOOK_URL: "https://n8n.invalid/webhook/aji" });

    try {
      const { order } = await placeOrder();
      const aji = await makeUser({ role: "owner" });

      const started = Date.now();
      const accepted = await orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" });

      expect(accepted.status).toBe("ACCEPTED");
      expect(Date.now() - started).toBeLessThan(2000);
      expect(hung).toHaveBeenCalledOnce();
      const init = hung.mock.calls[0]?.[1] as RequestInit | undefined;
      const payload = JSON.parse(String(init?.body)) as { orderNumber: string; status: string };
      expect(payload.status).toBe("ACCEPTED");
      expect(payload.orderNumber).toBe(accepted.orderNumber);
      // Saved either way: the notification is not part of the transaction.
      expect((await Order.findById(order.id).lean())!.status).toBe("ACCEPTED");
    } finally {
      Object.assign(env, { N8N_WEBHOOK_URL: undefined });
    }
  });

  it("a webhook that rejects never breaks the order", async () => {
    const { env } = await import("../src/config/env");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    Object.assign(env, { N8N_WEBHOOK_URL: "https://n8n.invalid/webhook/aji" });

    try {
      const { order } = await placeOrder();
      const aji = await makeUser({ role: "owner" });
      const accepted = await orderService.decideOrder(order.id, "ACCEPTED", { id: aji.id, role: "owner" });
      expect(accepted.status).toBe("ACCEPTED");
    } finally {
      Object.assign(env, { N8N_WEBHOOK_URL: undefined });
    }
  });
});
