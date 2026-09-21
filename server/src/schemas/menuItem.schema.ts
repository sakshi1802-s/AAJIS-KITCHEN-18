import { z } from "zod";
import { CATEGORIES } from "@shared/api";

/**
 * Prices arrive in paise — the client converts from rupees at its edge.
 *
 * The field validators are declared once, WITHOUT defaults, and the defaults
 * are added only to the create schema. That separation matters: a partial
 * update built from a schema carrying defaults would quietly fill in every
 * omitted field, so flipping one availability switch would blank the Marathi
 * name and reset a dish's stock to "unlimited".
 */
const fields = {
  name: z.string().trim().min(2, "Give the dish a name").max(80),
  nameMarathi: z.string().trim().max(80),
  description: z.string().trim().max(500),
  category: z.enum(CATEGORIES),
  unitLabel: z.string().trim().min(2, "e.g. per plate, per kg").max(40),
  price: z.number().int("Price must be a whole number of paise").min(0).max(10_000_000),
  minQuantity: z.number().int().min(1).max(500),
  servesApprox: z.number().int().min(1).max(500),
  isAvailable: z.boolean(),
  // null = made to order (unlimited); a number = a fixed batch.
  stockCount: z.number().int().min(0).max(10_000).nullable(),
  imageUrl: z.url("That doesn't look like an image link").nullable(),
  isVeg: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12),
};

export const createMenuItemSchema = z.object({
  ...fields,
  nameMarathi: fields.nameMarathi.default(""),
  description: fields.description.default(""),
  minQuantity: fields.minQuantity.default(1),
  servesApprox: fields.servesApprox.default(1),
  isAvailable: fields.isAvailable.default(true),
  stockCount: fields.stockCount.default(null),
  imageUrl: fields.imageUrl.default(null),
  isVeg: fields.isVeg.default(true),
  tags: fields.tags.default([]),
});

/** Only the keys actually sent are updated — nothing else is touched. */
export const updateMenuItemSchema = z
  .object(fields)
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Nothing to update");

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
