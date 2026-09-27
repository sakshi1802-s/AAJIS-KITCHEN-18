/**
 * Orders — placing them, reading them, and moving them between statuses.
 *
 * Two things in this file are the heart of the project:
 *
 *   1. placeOrder() revalidates the cart against the database and takes stock
 *      with ONE conditional update per line, so two customers racing for the
 *      last unit can never both win.
 *   2. transitionOrder() is the only way a status ever changes. It checks an
 *      explicit allow-map, guards the write with the status it read, restores
 *      stock when an order dies, and is the single place the notification
 *      hook fires from.
 */
import type { Types } from "mongoose";
import type { CartConflict, OrderDTO, OrderStatus, Role } from "@shared/api";
import { AppError, Forbidden, InvalidTransition, NotFound } from "../lib/errors";
import { logger } from "../lib/logger";
import { generateOrderNumber } from "../lib/orderNumber";
import { MenuItem, type MenuItemDoc } from "../models/MenuItem";
import { Order, toOrderDTO, type OrderHydrated, type OrderLine } from "../models/Order";
import { User } from "../models/User";
import type { PlaceOrderInput } from "../schemas/order.schema";
import { notifyOrderStatus } from "./notify";

export interface Actor {
  id: string;
  role: Role;
}

/** A line of stock we took, so we can hand it back if anything later fails. */
interface StockTaken {
  menuItemId: string;
  quantity: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Placing an order
// ─────────────────────────────────────────────────────────────────────────

export async function placeOrder(userId: string, input: PlaceOrderInput): Promise<OrderDTO> {
  // Step 1 — re-read every dish from the database. The cart in the browser may
  // be minutes or days old; nothing it says about price or stock is trusted.
  const ids = input.items.map((line) => line.menuItemId);
  const current = await MenuItem.find({ _id: { $in: ids }, isDeleted: false }).lean();
  const byId = new Map(current.map((item) => [item._id.toString(), item]));

  // Step 2 — collect EVERY problem, not just the first, so the customer sees
  // one complete diff instead of fixing their cart one dish at a time.
  const conflicts: CartConflict[] = [];
  for (const line of input.items) {
    const item = byId.get(line.menuItemId);
    if (!item) {
      conflicts.push({ kind: "NOT_FOUND", menuItemId: line.menuItemId, name: null });
      continue;
    }
    if (!item.isAvailable) {
      conflicts.push({ kind: "UNAVAILABLE", menuItemId: line.menuItemId, name: item.name });
    } else if (item.stockCount !== null && item.stockCount < line.quantity) {
      conflicts.push({
        kind: "INSUFFICIENT_STOCK",
        menuItemId: line.menuItemId,
        name: item.name,
        requested: line.quantity,
        available: item.stockCount,
      });
    }
    if (item.price !== line.expectedPrice) {
      conflicts.push({
        kind: "PRICE_CHANGED",
        menuItemId: line.menuItemId,
        name: item.name,
        oldPrice: line.expectedPrice,
        newPrice: item.price,
      });
    }
    if (line.quantity < item.minQuantity) {
      conflicts.push({
        kind: "BELOW_MINIMUM",
        menuItemId: line.menuItemId,
        name: item.name,
        requested: line.quantity,
        minQuantity: item.minQuantity,
      });
    }
  }
  if (conflicts.length > 0) throw cartConflict(conflicts);

  // Step 3 — take the stock. Everything above was a *check*; this is the
  // commit, and it has to be safe against another customer doing the same
  // thing at the same moment.
  const taken: StockTaken[] = [];
  try {
    for (const line of input.items) {
      const updated = await decrementStock(line.menuItemId, line.quantity, line.expectedPrice);
      if (!updated) {
        // Something changed between the check and the commit. Re-read the dish
        // to say exactly what, then unwind.
        throw cartConflict([await explainFailure(line.menuItemId, line.quantity, line.expectedPrice)]);
      }
      // Unlimited dishes ("she'll make more") never consumed anything, so they
      // must not be handed back later either.
      if (updated.stockCount !== null) taken.push({ menuItemId: line.menuItemId, quantity: line.quantity });
    }

    // Step 4 — write the order. Name and price are SNAPSHOTS: if Aji raises the
    // price of sabudana vada in November, this October order must not change.
    const lines: OrderLine[] = input.items.map((line) => {
      const item = byId.get(line.menuItemId)!;
      return {
        menuItemId: item._id,
        nameSnapshot: item.name,
        quantity: line.quantity,
        unitLabel: item.unitLabel,
        priceAtOrder: item.price,
        stockDecremented: taken.some((t) => t.menuItemId === line.menuItemId),
      };
    });
    const totalAmount = lines.reduce((sum, line) => sum + line.priceAtOrder * line.quantity, 0);

    const order = await createOrderWithNumber({
      userId,
      items: lines,
      totalAmount,
      requestedFor: input.requestedFor,
      deliveryAddress: input.deliveryAddress,
      customerPhone: input.customerPhone,
      customerNotes: input.customerNotes,
    });

    return toOrderDTO(order);
  } catch (err) {
    // Any failure after stock was taken — a later line, a database error, a
    // duplicate order number — puts every unit back.
    await restoreStock(taken);
    throw err;
  }
}

/**
 * THE atomic stock decrement.
 *
 * Read-then-write oversells: two requests both read "1 left", both decide
 * that's enough, and both write 0. Instead, the conditions and the subtraction
 * happen inside ONE document update, which MongoDB applies atomically:
 *
 *   - the filter re-states every condition (not deleted, still available,
 *     price unchanged, and either unlimited stock or enough of it)
 *   - the update pipeline subtracts only when stockCount is a number
 *
 * Whoever loses the race fails the filter, gets null back, and is told why.
 *
 * Note the $cond: `$inc` cannot be used here, because `$inc` on a null field
 * throws "Cannot apply $inc to a value of non-numeric type". An update
 * pipeline lets one query serve both the finite and the unlimited case.
 */
async function decrementStock(menuItemId: string, quantity: number, expectedPrice: number) {
  return MenuItem.findOneAndUpdate(
    {
      _id: menuItemId,
      isDeleted: false,
      isAvailable: true,
      price: expectedPrice,
      $or: [{ stockCount: null }, { stockCount: { $gte: quantity } }],
    },
    [
      {
        $set: {
          stockCount: {
            $cond: [{ $eq: ["$stockCount", null] }, null, { $subtract: ["$stockCount", quantity] }],
          },
        },
      },
    ],
    // updatePipeline: Mongoose 9 asks us to opt in before it will send an
    // aggregation-pipeline update rather than a plain update document.
    { returnDocument: "after", updatePipeline: true },
  ).lean();
}

/** Puts stock back. Only ever called with lines that actually took some. */
async function restoreStock(taken: StockTaken[]): Promise<void> {
  for (const line of taken) {
    try {
      await MenuItem.updateOne(
        // If Aji has since switched this dish to unlimited, there is nothing to
        // restore — $ne: null keeps us from turning null into a number.
        { _id: line.menuItemId, stockCount: { $ne: null } },
        { $inc: { stockCount: line.quantity } },
      );
    } catch (err) {
      // Never let a restore failure mask the original error.
      logger.error(`Failed to restore ${line.quantity} of ${line.menuItemId}`, err);
    }
  }
}

/** Why did the conditional update match nothing? Re-read and say precisely. */
async function explainFailure(menuItemId: string, quantity: number, expectedPrice: number): Promise<CartConflict> {
  const item = await MenuItem.findOne({ _id: menuItemId, isDeleted: false }).lean();
  if (!item) return { kind: "NOT_FOUND", menuItemId, name: null };
  if (!item.isAvailable) return { kind: "UNAVAILABLE", menuItemId, name: item.name };
  if (item.price !== expectedPrice) {
    return { kind: "PRICE_CHANGED", menuItemId, name: item.name, oldPrice: expectedPrice, newPrice: item.price };
  }
  return {
    kind: "INSUFFICIENT_STOCK",
    menuItemId,
    name: item.name,
    requested: quantity,
    available: item.stockCount ?? 0,
  };
}

function cartConflict(conflicts: CartConflict[]): AppError {
  return new AppError(
    409,
    "CART_CONFLICT",
    conflicts.length === 1
      ? "Something in your cart changed while you were ordering."
      : "A few things in your cart changed while you were ordering.",
    { conflicts },
  );
}

interface NewOrderFields {
  userId: string;
  items: OrderLine[];
  totalAmount: number;
  requestedFor: PlaceOrderInput["requestedFor"];
  deliveryAddress: PlaceOrderInput["deliveryAddress"];
  customerPhone: string;
  customerNotes: string;
}

/** Order numbers are random, so retry the (very unlikely) collision. */
async function createOrderWithNumber(fields: NewOrderFields): Promise<OrderHydrated> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await Order.create({ ...fields, orderNumber: generateOrderNumber(), status: "PLACED" });
    } catch (err) {
      const duplicate = typeof err === "object" && err !== null && "code" in err && err.code === 11000;
      if (!duplicate || attempt === 2) throw err;
      logger.warn("Order number collision, retrying");
    }
  }
  throw new AppError(500, "INTERNAL", "Could not create the order. Please try again.");
}

// ─────────────────────────────────────────────────────────────────────────
// Reading orders
// ─────────────────────────────────────────────────────────────────────────

export async function listMyOrders(userId: string): Promise<OrderDTO[]> {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(100);
  return orders.map((order) => toOrderDTO(order));
}

/**
 * Ownership is checked on every read. Someone else's order is reported as 404,
 * not 403 — a 403 would confirm that the id exists.
 */
export async function getOrder(orderId: string, actor: Actor): Promise<OrderDTO> {
  const order = await Order.findById(orderId);
  if (!order) throw NotFound("Order");
  if (actor.role !== "owner" && order.userId.toString() !== actor.id) throw NotFound("Order");

  const customer = actor.role === "owner" ? await loadCustomer(order.userId) : undefined;
  return toOrderDTO(order, customer ?? undefined);
}

async function loadCustomer(userId: Types.ObjectId) {
  return User.findById(userId).select("name email").lean();
}

// ─────────────────────────────────────────────────────────────────────────
// Status transitions — the allow-map
// ─────────────────────────────────────────────────────────────────────────

/**
 * Four states, one decision. Anything not in this map is illegal, which is
 * what stops a client PATCHing its own order to ACCEPTED.
 *
 *   PLACED ──accept──▶ ACCEPTED    (Aji; fires the WhatsApp message)
 *      │
 *      ├──decline───▶ DECLINED     (Aji, with a reason; stock goes back)
 *      └──cancel────▶ CANCELLED    (the customer, while still PLACED)
 *
 * ACCEPTED, DECLINED and CANCELLED are terminal: no preparing, no
 * out-for-delivery, no tracking.
 */
export const TRANSITIONS: Partial<Record<OrderStatus, Partial<Record<OrderStatus, Role>>>> = {
  PLACED: { ACCEPTED: "owner", DECLINED: "owner", CANCELLED: "customer" },
};

const STATUS_WORDS: Record<OrderStatus, string> = {
  PLACED: "waiting for Aji",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  CANCELLED: "cancelled",
};

interface TransitionInput {
  orderId: string;
  to: OrderStatus;
  actor: Actor;
  /** Aji's reason when declining. */
  note?: string;
}

/**
 * The single door every status change goes through — customer cancels and
 * Aji's decisions both land here, which is why the notification has exactly
 * one hook point.
 */
export async function transitionOrder({ orderId, to, actor, note }: TransitionInput): Promise<OrderDTO> {
  const order = await Order.findById(orderId);
  if (!order) throw NotFound("Order");

  const isOwnOrder = order.userId.toString() === actor.id;
  // Don't reveal other people's orders, even to say "you can't do that".
  if (actor.role !== "owner" && !isOwnOrder) throw NotFound("Order");

  const requiredRole = TRANSITIONS[order.status]?.[to];
  if (!requiredRole) {
    throw InvalidTransition(
      `This order is already ${STATUS_WORDS[order.status]}, so it can't be ${STATUS_WORDS[to]} now.`,
    );
  }
  if (requiredRole === "owner" && actor.role !== "owner") {
    throw Forbidden("Only Aji can accept or decline an order.");
  }
  if (requiredRole === "customer" && !isOwnOrder) {
    throw Forbidden("You can only cancel your own order.");
  }

  // The write is conditional on the status we just read. If a cancel and a
  // decline arrive together, one of them updates nothing and is told to
  // refresh — otherwise both would restore the same stock.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: { status: to, ownerNote: note ?? null, decidedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!updated) {
    throw InvalidTransition("That order was just updated somewhere else. Refresh to see where it stands.");
  }

  // An order that dies gives its stock back — and only the lines that took any.
  if (to === "DECLINED" || to === "CANCELLED") {
    await restoreStock(
      updated.items
        .filter((line) => line.stockDecremented)
        .map((line) => ({ menuItemId: line.menuItemId.toString(), quantity: line.quantity })),
    );
  }

  const customer = await loadCustomer(updated.userId);
  // Fire and forget: the customer's response does not wait on WhatsApp.
  notifyOrderStatus({
    orderNumber: updated.orderNumber,
    status: updated.status,
    customerName: customer?.name ?? "Customer",
    customerPhone: updated.customerPhone,
    items: updated.items.map((line) => ({
      name: line.nameSnapshot,
      quantity: line.quantity,
      unitPrice: line.priceAtOrder,
      lineTotal: line.priceAtOrder * line.quantity,
    })),
    total: updated.totalAmount,
    requestedFor: updated.requestedFor,
    deliveryAddress: updated.deliveryAddress,
    ownerNote: updated.ownerNote,
  });

  return toOrderDTO(updated, customer ?? undefined);
}

/** The customer's own cancel, while the order is still waiting. */
export function cancelOrder(orderId: string, actor: Actor): Promise<OrderDTO> {
  return transitionOrder({ orderId, to: "CANCELLED", actor });
}

/** Aji's one decision. Accepting is what fires the WhatsApp message. */
export function decideOrder(
  orderId: string,
  decision: "ACCEPTED" | "DECLINED",
  actor: Actor,
  reason?: string,
): Promise<OrderDTO> {
  return transitionOrder({ orderId, to: decision, actor, note: reason });
}

export type { MenuItemDoc };
