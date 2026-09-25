import { Schema, Types, model, type HydratedDocument } from "mongoose";
import type { ReviewDTO } from "@shared/api";

/**
 * A fourth collection, added because customers now leave reviews and Aaji
 * decides which ones appear on the site. It doesn't belong on `orders` (a
 * review isn't tied to one order) or on `users` (she moderates them one by
 * one), so it gets its own.
 */
export interface ReviewDoc {
  userId: Types.ObjectId;
  /** Copied at write time, so the card still reads if a name changes later. */
  nameSnapshot: string;
  occasion: string;
  rating: number;
  text: string;
  /** Aaji decides what the public sees; nothing shows until she says so. */
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nameSnapshot: { type: String, required: true, trim: true, maxlength: 80 },
    occasion: { type: String, default: "", trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    text: { type: String, required: true, trim: true, minlength: 10, maxlength: 600 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "reviews" },
);

// The public strip reads published reviews newest first; Aaji's queue reads
// everything newest first.
reviewSchema.index({ isPublished: 1, createdAt: -1 });

export const Review = model<ReviewDoc>("Review", reviewSchema);
export type ReviewHydrated = HydratedDocument<ReviewDoc>;

export function toReviewDTO(review: ReviewHydrated): ReviewDTO {
  return {
    id: review._id.toString(),
    name: review.nameSnapshot,
    occasion: review.occasion,
    rating: review.rating,
    text: review.text,
    isPublished: review.isPublished,
    createdAt: review.createdAt.toISOString(),
  };
}
