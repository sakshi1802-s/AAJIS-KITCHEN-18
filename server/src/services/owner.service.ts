/** Everything behind /api/owner — Aji's dashboard. */
import type { QueryFilter } from "mongoose";
import { SLOTS, type MenuItemDTO, type OrderDTO, type OwnerStatsDTO } from "@shared/api";
import { NotFound } from "../lib/errors";
import { istDateString, istDayStart, istWeekStart } from "../lib/time";
import { MenuItem, toMenuItemDTO, type MenuItemDoc } from "../models/MenuItem";
import { Order, toOrderDTO, type OrderDoc } from "../models/Order";
import { User } from "../models/User";
import type { CreateMenuItemInput, UpdateMenuItemInput } from "../schemas/menuItem.schema";
import type { OwnerOrdersQueryInput } from "../schemas/order.schema";

/**
 * Aji's list. Orders needing a decision come first — that's the whole point of
 * the screen — then the rest by when they're wanted.
 */
export async function listOrders(query: OwnerOrdersQueryInput): Promise<OrderDTO[]> {
  const filter: QueryFilter<OrderDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.date) filter["requestedFor.date"] = query.date;

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);

  // One extra query for the customer names, rather than a join per order.
  const customers = await User.find({ _id: { $in: orders.map((order) => order.userId) } })
    .select("name email")
    .lean();
  const byId = new Map(customers.map((customer) => [customer._id.toString(), customer]));

  return orders
    .sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "PLACED") return -1;
        if (b.status === "PLACED") return 1;
      }
      return (
        a.requestedFor.date.localeCompare(b.requestedFor.date) ||
        SLOTS.indexOf(a.requestedFor.slot) - SLOTS.indexOf(b.requestedFor.slot)
      );
    })
    .map((order) => toOrderDTO(order, byId.get(order.userId.toString()) ?? undefined));
}

/** The three numbers on the dashboard cards, all on IST boundaries. */
export async function getStats(): Promise<OwnerStatsDTO> {
  const [ordersToday, waitingForDecision, weekTotals] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: istDayStart(istDateString()) } }),
    Order.countDocuments({ status: "PLACED" }),
    Order.aggregate<{ total: number }>([
      { $match: { status: "ACCEPTED", createdAt: { $gte: istDayStart(istWeekStart()) } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return { ordersToday, waitingForDecision, weekTotal: weekTotals[0]?.total ?? 0 };
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItemDTO> {
  const item = await MenuItem.create(input);
  return toMenuItemDTO(item);
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItemDTO> {
  const item = await MenuItem.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: input }, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!item) throw NotFound("Dish");
  return toMenuItemDTO(item);
}

/**
 * Soft delete: old orders still point at this dish, and their snapshots must
 * keep making sense. Hidden from the menu, never removed.
 */
export async function softDeleteMenuItem(id: string): Promise<void> {
  const item = await MenuItem.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true, isAvailable: false } },
  );
  if (!item) throw NotFound("Dish");
}

export type { MenuItemDoc };
