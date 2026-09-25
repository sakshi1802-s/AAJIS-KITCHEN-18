import { Router } from "express";
import * as owner from "../controllers/owner.controller";
import * as reviews from "../controllers/reviews.controller";
import { requireAuth, requireOwner } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { createMenuItemSchema, updateMenuItemSchema } from "../schemas/menuItem.schema";
import { ownerDecisionSchema, ownerOrdersQuerySchema } from "../schemas/order.schema";
import { publishReviewSchema } from "../schemas/review.schema";

export const ownerRouter = Router();

// Aji only — every route below is behind both gates.
ownerRouter.use(requireAuth, requireOwner);

ownerRouter.get("/orders", validate({ query: ownerOrdersQuerySchema }), owner.listOrders);
ownerRouter.patch(
  "/orders/:id/status",
  validate({ params: idParams, body: ownerDecisionSchema }),
  owner.decideOrder,
);
ownerRouter.get("/stats", owner.getStats);

// Aaji chooses which reviews the home page shows.
ownerRouter.get("/reviews", reviews.listAll);
ownerRouter.patch(
  "/reviews/:id",
  validate({ params: idParams, body: publishReviewSchema }),
  reviews.setPublished,
);

ownerRouter.post("/menu", validate({ body: createMenuItemSchema }), owner.createMenuItem);
ownerRouter.patch("/menu/:id", validate({ params: idParams, body: updateMenuItemSchema }), owner.updateMenuItem);
ownerRouter.delete("/menu/:id", validate({ params: idParams }), owner.deleteMenuItem);
