import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { googleAuthSchema } from "../schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/google", validate({ body: googleAuthSchema }), auth.googleSignIn);
authRouter.get("/me", requireAuth, auth.me);
authRouter.post("/logout", auth.logout);
