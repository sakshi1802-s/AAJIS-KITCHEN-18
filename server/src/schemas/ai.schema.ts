import { z } from "zod";

export const aiSuggestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(4, "Tell us a little about the occasion")
    .max(500, "Keep it under 500 characters"),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
