/**
 * The API contract shared by /client and /server.
 *
 * Plain TypeScript with zero imports: types plus a few `as const` enum arrays.
 * The client (Vite) and server (tsx / tsup) both compile it straight from
 * source, so nothing has to be built or published.
 *
 * Money: every price / total is an INTEGER COUNT OF PAISE (₹280 === 28000).
 * Dates: `requestedFor.date` is an IST calendar date string "YYYY-MM-DD".
 */

// ── Enums ────────────────────────────────────────────────────────────────

export const CATEGORIES = ["breakfast", "snacks", "meals", "sweets", "festive", "upvas"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SLOTS = ["morning", "afternoon", "evening"] as const;
export type Slot = (typeof SLOTS)[number];

export const ORDER_STATUSES = ["PLACED", "ACCEPTED", "DECLINED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Role = "customer" | "owner";

// ── Errors ───────────────────────────────────────────────────────────────

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CART_CONFLICT"
  | "INVALID_TRANSITION"
  | "RATE_LIMITED"
  | "INTERNAL";

/** The one error shape every endpoint returns. */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

// ── Health ───────────────────────────────────────────────────────────────

export interface HealthDTO {
  status: "ok";
  db: "connected" | "disconnected";
  uptimeSeconds: number;
  time: string;
}

// ── Menu ─────────────────────────────────────────────────────────────────

export interface MenuItemDTO {
  id: string;
  name: string;
  nameMarathi: string;
  description: string;
  category: Category;
  unitLabel: string;
  /** paise */
  price: number;
  minQuantity: number;
  servesApprox: number;
  isAvailable: boolean;
  /** null = unlimited (made to order); number = finite batch */
  stockCount: number | null;
  imageUrl: string | null;
  isVeg: boolean;
  tags: string[];
}

export interface MenuQuery {
  category?: Category;
  isVeg?: boolean;
  search?: string;
}

/** Owner create / edit payload (paise). */
export interface MenuItemInput {
  name: string;
  nameMarathi: string;
  description: string;
  category: Category;
  unitLabel: string;
  price: number;
  minQuantity: number;
  servesApprox: number;
  isAvailable: boolean;
  stockCount: number | null;
  imageUrl: string | null;
  isVeg: boolean;
  tags: string[];
}

// ── Users & auth ─────────────────────────────────────────────────────────

export interface AddressDTO {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<AddressDTO, "id">;

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  addresses: AddressDTO[];
}

export interface GoogleAuthRequest {
  /** The Google ID token (JWT) from Google Identity Services. */
  credential: string;
}

export interface UpdateMeRequest {
  name?: string;
  phone?: string;
}

// ── Orders ───────────────────────────────────────────────────────────────

export interface RequestedFor {
  /** IST calendar date, "YYYY-MM-DD" */
  date: string;
  slot: Slot;
}

export interface DeliveryAddress {
  label: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
}

export interface OrderLineDTO {
  menuItemId: string;
  nameSnapshot: string;
  quantity: number;
  unitLabel: string;
  /** paise, copied at order time — never joined from the menu */
  priceAtOrder: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  items: OrderLineDTO[];
  /** paise */
  totalAmount: number;
  requestedFor: RequestedFor;
  deliveryAddress: DeliveryAddress;
  customerPhone: string;
  customerNotes: string;
  status: OrderStatus;
  ownerNote: string | null;
  decidedAt: string | null;
  createdAt: string;
  /** Present on owner views. */
  customer?: { id: string; name: string; email: string };
}

export interface PlaceOrderItem {
  menuItemId: string;
  quantity: number;
  /** paise — the price the customer saw; the server re-checks it */
  expectedPrice: number;
}

export interface PlaceOrderRequest {
  items: PlaceOrderItem[];
  requestedFor: RequestedFor;
  deliveryAddress: DeliveryAddress;
  customerPhone: string;
  customerNotes?: string;
}

/** One line of the 409 CART_CONFLICT diff. */
export type CartConflict =
  | { kind: "NOT_FOUND"; menuItemId: string; name: string | null }
  | { kind: "UNAVAILABLE"; menuItemId: string; name: string }
  | { kind: "INSUFFICIENT_STOCK"; menuItemId: string; name: string; requested: number; available: number }
  | { kind: "PRICE_CHANGED"; menuItemId: string; name: string; oldPrice: number; newPrice: number };

export interface CartConflictDetails {
  conflicts: CartConflict[];
}

// ── Owner ────────────────────────────────────────────────────────────────

export type OwnerDecision = "ACCEPTED" | "DECLINED";

export interface OwnerDecisionRequest {
  decision: OwnerDecision;
  /** Required when declining. */
  reason?: string;
}

export interface OwnerOrdersQuery {
  status?: OrderStatus;
  /** requestedFor.date, "YYYY-MM-DD" */
  date?: string;
}

export interface OwnerStatsDTO {
  ordersToday: number;
  waitingForDecision: number;
  /** paise — accepted orders placed this week (Mon–Sun, IST) */
  weekTotal: number;
}

// ── AI: "Plan my order" ──────────────────────────────────────────────────

export interface AiSuggestRequest {
  text: string;
}

export interface AiSuggestedLine {
  item: MenuItemDTO;
  quantity: number;
  reason: string;
  /** paise, computed server-side from the DB price */
  lineTotal: number;
}

export interface AiSuggestResponse {
  source: "ai" | "fallback";
  summary: string;
  items: AiSuggestedLine[];
  /** paise */
  total: number;
}
