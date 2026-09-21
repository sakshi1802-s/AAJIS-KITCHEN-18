import { Router } from "express";
import * as orders from "../controllers/orders.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { placeOrderSchema } from "../schemas/order.schema";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post("/", validate({ body: placeOrderSchema }), orders.placeOrder);
ordersRouter.get("/me", orders.listMyOrders);
ordersRouter.get("/:id", validate({ params: idParams }), orders.getOrder);
ordersRouter.post("/:id/cancel", validate({ params: idParams }), orders.cancelOrder);
