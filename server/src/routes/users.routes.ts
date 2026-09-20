import { Router } from "express";
import * as users from "../controllers/users.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { idParams } from "../schemas/common.schema";
import { addressSchema, updateMeSchema } from "../schemas/user.schema";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.patch("/me", validate({ body: updateMeSchema }), users.updateMe);
usersRouter.post("/me/addresses", validate({ body: addressSchema }), users.addAddress);
usersRouter.delete("/me/addresses/:id", validate({ params: idParams }), users.removeAddress);
