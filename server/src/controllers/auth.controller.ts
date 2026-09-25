import type { RequestHandler } from "express";
import type { UserDTO } from "@shared/api";
import { toUserDTO } from "../models/User";
import { valid } from "../middleware/validate";
import { googleAuthSchema, loginSchema, registerSchema } from "../schemas/auth.schema";
import {
  loginWithPassword,
  registerWithPassword,
  clearSessionCookie,
  setSessionCookie,
  signSession,
  upsertUserFromGoogle,
  verifyGoogleCredential,
} from "../services/auth.service";
import * as userService from "../services/user.service";

export const googleSignIn: RequestHandler = async (req, res) => {
  const { credential } = valid(req, "body", googleAuthSchema);

  const profile = await verifyGoogleCredential(credential);
  const user = await upsertUserFromGoogle(profile);
  setSessionCookie(res, signSession(user));

  const body: UserDTO = toUserDTO(user);
  res.json(body);
};

export const register: RequestHandler = async (req, res) => {
  const user = await registerWithPassword(valid(req, "body", registerSchema));
  setSessionCookie(res, signSession(user));

  const body: UserDTO = toUserDTO(user);
  res.status(201).json(body);
};

export const login: RequestHandler = async (req, res) => {
  const user = await loginWithPassword(valid(req, "body", loginSchema));
  setSessionCookie(res, signSession(user));

  const body: UserDTO = toUserDTO(user);
  res.json(body);
};

export const me: RequestHandler = async (req, res) => {
  const body: UserDTO = await userService.getMe(req.user!.id);
  res.json(body);
};

export const logout: RequestHandler = (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
};
