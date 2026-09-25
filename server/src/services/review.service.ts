import type { ReviewDTO } from "@shared/api";
import { NotFound, Unauthenticated } from "../lib/errors";
import { Review, toReviewDTO } from "../models/Review";
import { User } from "../models/User";
import type { CreateReviewInput } from "../schemas/review.schema";

const PUBLIC_LIMIT = 30;

/** What the marquee on the home page shows: published reviews, newest first. */
export async function listPublishedReviews(): Promise<ReviewDTO[]> {
  const reviews = await Review.find({ isPublished: true }).sort({ createdAt: -1 }).limit(PUBLIC_LIMIT);
  return reviews.map(toReviewDTO);
}

/** A signed-in customer leaves a review. It stays hidden until Aaji publishes it. */
export async function createReview(userId: string, input: CreateReviewInput): Promise<ReviewDTO> {
  const user = await User.findById(userId).select("name").lean();
  if (!user) throw Unauthenticated();

  const review = await Review.create({
    userId,
    nameSnapshot: user.name,
    occasion: input.occasion,
    rating: input.rating,
    text: input.text,
    isPublished: false,
  });

  return toReviewDTO(review);
}

/** The customer's own reviews, so they can see whether one is up yet. */
export async function listMyReviews(userId: string): Promise<ReviewDTO[]> {
  const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
  return reviews.map(toReviewDTO);
}

/** Aaji's queue: everything, newest first, published or not. */
export async function listAllReviews(): Promise<ReviewDTO[]> {
  const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(200);
  return reviews.map(toReviewDTO);
}

/** Aaji decides what the public sees. */
export async function setReviewPublished(reviewId: string, isPublished: boolean): Promise<ReviewDTO> {
  const review = await Review.findByIdAndUpdate(reviewId, { $set: { isPublished } }, { returnDocument: "after" });
  if (!review) throw NotFound("Review");
  return toReviewDTO(review);
}
