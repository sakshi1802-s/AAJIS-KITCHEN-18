/**
 * The notification seam (roadmap section 7).
 *
 * Two rules, both non-negotiable:
 *   1. Never awaited on the request path. The order is saved and the response
 *      returns; if the webhook is slow or down, orders still work.
 *   2. It no-ops when N8N_WEBHOOK_URL is unset, so the whole project runs,
 *      demos and deploys without n8n ever existing.
 *
 * n8n plugs in later: Webhook (guarded by the shared secret header) → Switch
 * on status → format the message → Twilio WhatsApp.
 */
import type { OrderStatus, Slot } from "@shared/api";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export interface OrderNotification {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  /** paise */
  total: number;
  requestedFor: { date: string; slot: Slot };
  /** Aji's reason when she declines. */
  ownerNote: string | null;
}

const TIMEOUT_MS = 5_000;

export function notifyOrderStatus(notification: OrderNotification): void {
  const url = env.N8N_WEBHOOK_URL;
  if (!url) return; // no-op until n8n exists

  // Deliberately not awaited, and every failure path ends in a log line.
  void fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": env.N8N_SECRET },
    body: JSON.stringify(notification),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
    .then((res) => {
      if (!res.ok) logger.warn(`notify: webhook returned ${res.status} for ${notification.orderNumber}`);
      else logger.debug(`notify: sent ${notification.status} for ${notification.orderNumber}`);
    })
    .catch((err: unknown) => logger.warn("notify failed", err));
}
