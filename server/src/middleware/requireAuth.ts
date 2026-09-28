import type { RequestHandler } from "express";
import { Forbidden, Unauthenticated } from "../lib/errors";
import { User } from "../models/User";
import { readSession, type SessionScope } from "../services/auth.service";

/**
 * Gate for everything a signed-in customer can do.
 *
 * The cookie proves who the user is; the ROLE is re-read from the database on
 * every request rather than trusted from the token, so a role change (or a
 * deleted account) takes effect immediately instead of waiting out the
 * session's seven days.
 */
const gate = (scope: SessionScope): RequestHandler => {
  return async (req, _res, next) => {
    const session = readSession(req, scope);
    if (!session) throw Unauthenticated();

    const user = await User.findById(session.userId).select("role").lean();
    if (!user) throw Unauthenticated("Your session has expired. Please sign in again.");

    req.user = { id: session.userId, role: user.role };
    next();
  };
};

/** The shop: ordering, the plate, reviews, the planner. */
export const requireAuth = gate("customer");

/** The kitchen's own door, read only by /api/owner. */
export const requireKitchenAuth = gate("kitchen");

/** Aji only. Always used after requireAuth. */
export const requireOwner: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "owner") throw Forbidden("Only Aji can do that.");
  next();
};
