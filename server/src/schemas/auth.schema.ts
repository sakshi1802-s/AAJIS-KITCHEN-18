import { z } from "zod";

export const googleAuthSchema = z.object({
  credential: z.string().min(20, "Missing Google credential"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()),
  password: z.string().min(1, "Enter your password").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
