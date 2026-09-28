import { z } from "zod";

/** Which door this sign-in is for; the cookie it sets follows from it. */
const scope = z.enum(["customer", "kitchen"]).default("customer");

export const googleAuthSchema = z.object({
  scope,
  credential: z.string().min(20, "Missing Google credential"),
});

export const registerSchema = z.object({
  scope,
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export const loginSchema = z.object({
  scope,
  email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()),
  password: z.string().min(1, "Enter your password").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
