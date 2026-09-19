import { z } from "zod";
import { CATEGORIES } from "@shared/api";
import { queryBoolean } from "./common.schema";

export const menuQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  isVeg: queryBoolean.optional(),
  search: z.string().trim().max(60).optional(),
});
export type MenuQueryInput = z.infer<typeof menuQuerySchema>;
