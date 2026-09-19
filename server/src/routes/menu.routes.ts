import { Router } from "express";
import * as menu from "../controllers/menu.controller";
import { validate } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { menuQuerySchema } from "../schemas/menu.schema";

export const menuRouter = Router();

menuRouter.get("/", validate({ query: menuQuerySchema }), menu.listMenu);
menuRouter.get("/:id", validate({ params: idParams }), menu.getMenuItem);
