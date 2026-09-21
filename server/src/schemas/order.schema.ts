import { z } from "zod";
import { ORDER_STATUSES, SLOTS } from "@shared/api";
import { addDays, istDateString } from "../lib/time";
import { objectId } from "./common.schema";
import { phoneSchema } from "./user.schema";

/** How far ahead an order may be requested. Aji still decides if she can do it. */
const MAX_DAYS_AHEAD = 60;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: objectId,
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(500),
        // What the customer saw. The server re-checks it against the database
        // at commit time; a mismatch is a 409, never a silent charge.
        expectedPrice: z.number().int().min(0),
      }),
    )
    .min(1, "Your cart is empty")
    .max(50)
    .refine(
      (items) => new Set(items.map((i) => i.menuItemId)).size === items.length,
      "The same dish appears twice in your cart",
    ),
  requestedFor: z.object({
    date: isoDate
      // IST calendar dates: "today" means today in Aji's kitchen, wherever
      // the server happens to run.
      .refine((date) => date >= istDateString(), "That date has already passed")
      .refine((date) => date <= addDays(istDateString(), MAX_DAYS_AHEAD), `Pick a date within ${MAX_DAYS_AHEAD} days`),
    slot: z.enum(SLOTS),
  }),
  deliveryAddress: z.object({
    label: z.string().trim().min(1).max(30),
    line1: z.string().trim().min(3, "Flat / building is required").max(120),
    line2: z.string().trim().max(120).default(""),
    city: z.string().trim().min(2, "City is required").max(60),
    pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  }),
  customerPhone: phoneSchema,
  customerNotes: z.string().trim().max(500).default(""),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const ownerDecisionSchema = z
  .object({
    decision: z.enum(["ACCEPTED", "DECLINED"]),
    reason: z.string().trim().max(300).optional(),
  })
  // Aji can accept without a word, but a decline always tells the customer why.
  .refine((body) => body.decision !== "DECLINED" || Boolean(body.reason?.length), {
    message: "Tell the customer why you can't take this order",
    path: ["reason"],
  });

export const ownerOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  date: isoDate.optional(),
});

export type OwnerOrdersQueryInput = z.infer<typeof ownerOrdersQuerySchema>;
