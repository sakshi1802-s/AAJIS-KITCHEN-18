import type { RequestHandler } from "express";
import type { UserDTO } from "@shared/api";
import { toUserDTO } from "../models/User";
import { valid } from "../middleware/validate";
import { googleAuthSchema, loginSchema, registerSchema } from "../schemas/auth.schema";
import { Unauthenticated } from "../lib/errors";
import {
  loginWithPassword,
  readSession,
  registerWithPassword,
  clearSessionCookie,
  setSessionCookie,
  signSession,
  upsertUserFromGoogle,
  verifyGoogleCredential,
  type SessionScope,
} from "../services/auth.service";
import * as userService from "../services/user.service";

/** Which door a request is talking about; the shop unless it says otherwise. */
const scopeOf = (req: Parameters<RequestHandler>[0]): SessionScope =>
  (req.query as Record<string, unknown>).scope === "kitchen" ? "kitchen" : "customer";

export const googleSignIn: RequestHandler = async (req, res) => {
  const { credential, scope } = valid(req, "body", googleAuthSchema);

  const profile = await verifyGoogleCredential(credential);
  const user = await upsertUserFromGoogle(profile);
  setSessionCookie(res, signSession(user), scope);

  const body: UserDTO = toUserDTO(user);
  res.json(body);
};

export const register: RequestHandler = async (req, res) => {
  const input = valid(req, "body", registerSchema);
  const user = await registerWithPassword(input);
  setSessionCookie(res, signSession(user), input.scope);

  const body: UserDTO = toUserDTO(user);
  res.status(201).json(body);
};

export const login: RequestHandler = async (req, res) => {
  const input = valid(req, "body", loginSchema);
  const user = await loginWithPassword(input);
  setSessionCookie(res, signSession(user), input.scope);

  const body: UserDTO = toUserDTO(user);
  res.json(body);
};

/**
 * Who am I at this door? Asked per scope, so the home page can be a customer
 * while the dashboard in another window is Aji.
 */
export const me: RequestHandler = async (req, res) => {
  const session = readSession(req, scopeOf(req));
  if (!session) throw Unauthenticated();

  try {
    const body: UserDTO = await userService.getMe(session.userId);
    res.json(body);
  } catch {
    // The account behind a valid cookie is gone: that is signed out, not 404.
    throw Unauthenticated("Your session has expired. Please sign in again.");
  }
};

/** Signs out of one door and leaves the other alone. */
export const logout: RequestHandler = (req, res) => {
  clearSessionCookie(res, scopeOf(req));
  res.status(204).end();
};
