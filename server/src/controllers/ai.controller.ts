import type { RequestHandler } from "express";
import type { AiSuggestResponse } from "@shared/api";
import { valid } from "../middleware/validate";
import { aiSuggestSchema } from "../schemas/ai.schema";
import { suggestCart } from "../services/ai.service";

export const suggest: RequestHandler = async (req, res) => {
  const { text } = valid(req, "body", aiSuggestSchema);
  const body: AiSuggestResponse = await suggestCart(text);
  res.json(body);
};
