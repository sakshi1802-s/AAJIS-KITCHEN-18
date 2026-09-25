import { z } from "zod";

export const createReviewSchema = z.object({
  occasion: z.string().trim().max(80).default(""),
  rating: z.number().int().min(1, "Give at least one star").max(5),
  text: z.string().trim().min(10, "Tell us a little more").max(600),
});

export const publishReviewSchema = z.object({
  isPublished: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
