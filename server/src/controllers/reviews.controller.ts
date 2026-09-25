import type { RequestHandler } from "express";
import type { ReviewDTO, ReviewsListResponse } from "@shared/api";
import { valid } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { createReviewSchema, publishReviewSchema } from "../schemas/review.schema";
import * as reviewService from "../services/review.service";

export const listPublished: RequestHandler = async (_req, res) => {
  const body: ReviewsListResponse = { reviews: await reviewService.listPublishedReviews() };
  res.json(body);
};

export const createReview: RequestHandler = async (req, res) => {
  const body: ReviewDTO = await reviewService.createReview(req.user!.id, valid(req, "body", createReviewSchema));
  res.status(201).json(body);
};

export const listMine: RequestHandler = async (req, res) => {
  const body: ReviewsListResponse = { reviews: await reviewService.listMyReviews(req.user!.id) };
  res.json(body);
};

export const listAll: RequestHandler = async (_req, res) => {
  const body: ReviewsListResponse = { reviews: await reviewService.listAllReviews() };
  res.json(body);
};

export const setPublished: RequestHandler = async (req, res) => {
  const { id } = valid(req, "params", idParams);
  const { isPublished } = valid(req, "body", publishReviewSchema);
  const body: ReviewDTO = await reviewService.setReviewPublished(id, isPublished);
  res.json(body);
};
