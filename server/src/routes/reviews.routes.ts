import { Router } from "express";
import * as reviews from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createReviewSchema } from "../schemas/review.schema";

export const reviewsRouter = Router();

// Anyone can read what Aaji has published.
reviewsRouter.get("/", reviews.listPublished);

// Leaving one, and seeing your own, needs an account.
reviewsRouter.post("/", requireAuth, validate({ body: createReviewSchema }), reviews.createReview);
reviewsRouter.get("/me", requireAuth, reviews.listMine);
