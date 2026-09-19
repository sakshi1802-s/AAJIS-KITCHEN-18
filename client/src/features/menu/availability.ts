import type { MenuItemDTO } from "@shared/api";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export type AvailabilityTone = "muted" | "danger" | "warn";

export interface Availability {
  /** Can the customer add at least the minimum quantity right now? */
  canOrder: boolean;
  /** Most units they could add (Infinity when made to order). */
  maxQuantity: number;
  badge: { label: string; tone: AvailabilityTone } | null;
}

/**
 * Display-side availability, driven by `isAvailable` and `stockCount`.
 * This is only what the page shows — the server re-checks all of it when the
 * order is placed, so a stale page can never oversell.
 */
export function getAvailability(item: Pick<MenuItemDTO, "isAvailable" | "stockCount" | "minQuantity">): Availability {
  if (!item.isAvailable) {
    return { canOrder: false, maxQuantity: 0, badge: { label: "Not available today", tone: "muted" } };
  }
  if (item.stockCount === null) {
    return { canOrder: true, maxQuantity: Number.POSITIVE_INFINITY, badge: null };
  }
  if (item.stockCount === 0) {
    return { canOrder: false, maxQuantity: 0, badge: { label: "Sold out", tone: "danger" } };
  }
  const canOrder = item.stockCount >= item.minQuantity;
  const low = item.stockCount <= LOW_STOCK_THRESHOLD || !canOrder;
  return {
    canOrder,
    maxQuantity: item.stockCount,
    badge: low ? { label: `Only ${item.stockCount} left`, tone: "warn" } : null,
  };
}
