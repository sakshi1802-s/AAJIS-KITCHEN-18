/**
 * Authentication — the whole flow lives here.
 *
 * The browser never sees a password and we never hold an OAuth client secret.
 * Google Identity Services hands the page a signed ID token; we verify that
 * token against Google's public keys, then mint OUR OWN short session JWT and
 * put it in an httpOnly cookie. From that point on the client sends nothing
 * but the cookie, and `userId` always comes from the token — never the body.
 *
 *   browser ──Google ID token──▶ POST /api/auth/google
 *                                  │ verifyIdToken (signature, issuer, audience, expiry)
 *                                  │ upsert the user, decide the role
 *                                  ▼
 *                               Set-Cookie: aji_session=<our JWT>; HttpOnly
 */
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import type { Role } from "@shared/api";
import { env, isProd } from "../config/env";
import { AppError, Forbidden, Unauthenticated } from "../lib/errors";
import { logger } from "../lib/logger";
import { User, type UserHydrated } from "../models/User";
import { hashPassword, verifyPassword } from "../lib/password";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";

const COOKIE_NAME = "aji_session";
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

export interface Session {
  userId: string;
  role: Role;
}

let client: OAuth2Client | undefined;
const googleClient = () => (client ??= new OAuth2Client(env.GOOGLE_CLIENT_ID));

/**
 * Step 1 — prove the ID token really came from Google, for OUR app.
 * `verifyIdToken` checks the RSA signature against Google's published keys,
 * that the issuer is Google, that the token hasn't expired, and — the part
 * that matters — that `aud` is our own client ID. Without the audience check
 * a token minted for any other site would be accepted here.
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError(503, "INTERNAL", "Google sign-in isn't configured on the server yet.");
  }

  let payload;
  try {
    const ticket = await googleClient().verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    logger.warn("Google ID token rejected", err);
    throw Unauthenticated("That Google sign-in couldn't be verified. Please try again.");
  }

  if (!payload?.sub || !payload.email) {
    throw Unauthenticated("Google didn't return enough profile information to sign you in.");
  }
  if (payload.email_verified === false) {
    throw Forbidden("Your Google account's email address isn't verified.");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0] || "Friend",
  };
}

/**
 * Step 2 — find or create the user.
 *
 * `googleId` is the identity, not the email: Google accounts can change their
 * address. The role is recomputed on every sign-in from OWNER_EMAIL, so Aji's
 * account becomes the owner the moment that variable is set, and no request
 * body can ever ask for a role.
 */
export async function upsertUserFromGoogle(profile: GoogleProfile): Promise<UserHydrated> {
  const role: Role = roleFor(profile.email);
  const fields = { email: profile.email, name: profile.name, role };

  try {
    return await User.findOneAndUpdate(
      { googleId: profile.googleId },
      { $set: fields, $setOnInsert: { phone: null, addresses: [] } },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    // The email is unique too: this address already belongs to a row created
    // under a different Google id. Attach the new id rather than failing.
    if (isDuplicateKeyError(err)) {
      const existing = await User.findOneAndUpdate(
        { email: profile.email },
        { $set: { ...fields, googleId: profile.googleId } },
        { returnDocument: "after" },
      );
      if (existing) return existing;
    }
    throw err;
  }
}

/** The role is decided by the email, never by anything the client sends. */
function roleFor(email: string) {
  return env.OWNER_EMAIL && email === env.OWNER_EMAIL ? "owner" : "customer";
}

/**
 * Sign up with an email and a password. The password is hashed with scrypt;
 * we never store or log the plain text.
 */
export async function registerWithPassword(input: RegisterInput): Promise<UserHydrated> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, "VALIDATION_ERROR", "That email already has an account. Sign in instead.");
  }

  return User.create({
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: roleFor(input.email),
    googleId: null,
    phone: null,
    addresses: [],
  });
}

/**
 * Sign in with an email and a password. The same message is returned whether
 * the address is unknown or the password is wrong, so the form cannot be used
 * to find out which addresses have accounts.
 */
export async function loginWithPassword(input: LoginInput): Promise<UserHydrated> {
  const user = await User.findOne({ email: input.email });
  const ok = await verifyPassword(input.password, user?.passwordHash ?? null);
  if (!user || !ok) {
    throw Unauthenticated("That email and password do not match.");
  }
  return user;
}

/** Step 3 — our own session token. Short-lived, signed with our secret. */
export function signSession(user: UserHydrated): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: `${SESSION_DAYS}d`,
  });
}

/**
 * httpOnly so no script can read it (an XSS bug can't steal the session the
 * way it could from localStorage); sameSite=lax so it isn't sent on
 * cross-site requests, which is our CSRF defence; secure in production.
 * The client and API share an origin — Vite proxy in dev, Vercel rewrite in
 * prod — so "lax" is enough and no third-party cookie is involved.
 */
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: SESSION_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" });
}

/** Reads and verifies our session cookie. Returns null for anything invalid. */
export function readSession(req: Request): Session | null {
  const token: unknown = (req.cookies as Record<string, unknown> | undefined)?.[COOKIE_NAME];
  if (typeof token !== "string" || !token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub) return null;
    const role = payload.role === "owner" ? "owner" : "customer";
    return { userId: payload.sub, role };
  } catch {
    // expired or tampered with — treat as signed out
    return null;
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}
