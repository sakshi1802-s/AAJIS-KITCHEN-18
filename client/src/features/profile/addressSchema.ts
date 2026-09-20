import { z } from "zod";

/** Mirrors the server's address schema — the server still validates it again. */
export const addressFormSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label").max(30),
  line1: z.string().trim().min(3, "Flat / building is required").max(120),
  line2: z.string().trim().max(120),
  city: z.string().trim().min(2, "City is required").max(60),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
