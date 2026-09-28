import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { googleAuthSchema, loginSchema, registerSchema } from "../schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), auth.register);
authRouter.post("/login", validate({ body: loginSchema }), auth.login);
authRouter.post("/google", validate({ body: googleAuthSchema }), auth.googleSignIn);
authRouter.get("/me", auth.me);
authRouter.post("/logout", auth.logout);
