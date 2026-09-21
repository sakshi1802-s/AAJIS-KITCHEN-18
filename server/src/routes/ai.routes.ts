import { Router } from "express";
import * as ai from "../controllers/ai.controller";
import { aiRateLimit } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { aiSuggestSchema } from "../schemas/ai.schema";

export const aiRouter = Router();

// requireAuth first, so the rate limit can key on the user.
aiRouter.post("/suggest", requireAuth, aiRateLimit, validate({ body: aiSuggestSchema }), ai.suggest);
