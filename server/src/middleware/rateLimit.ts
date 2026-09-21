import rateLimit from "express-rate-limit";
import { AppError } from "../lib/errors";

/**
 * "Plan my order" is the only endpoint that costs money, so it's the only one
 * that's limited: ten calls an hour, counted per signed-in user rather than
 * per IP (a household behind one connection shouldn't share a budget).
 */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? "anonymous",
  handler: () => {
    throw new AppError(
      429,
      "RATE_LIMITED",
      "You've used this a lot in the last hour. Give it a little while, or pick dishes from the menu yourself.",
    );
  },
});
