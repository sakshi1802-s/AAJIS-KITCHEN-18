import { z } from "zod";

/** Accepts "+91 98765 43210", "09876543210", "9876543210" → "9876543210". */
export const phoneSchema = z
  .string()
  .transform((raw) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    return digits;
  })
  .refine((d) => /^[6-9]\d{9}$/.test(d), "Enter a 10-digit Indian mobile number");

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(80).optional(),
    phone: phoneSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.phone !== undefined, "Nothing to update");

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label").max(30),
  line1: z.string().trim().min(3, "Flat / building is required").max(120),
  line2: z.string().trim().max(120).default(""),
  city: z.string().trim().min(2, "City is required").max(60),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  isDefault: z.boolean().default(false),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type AddressInputParsed = z.infer<typeof addressSchema>;
