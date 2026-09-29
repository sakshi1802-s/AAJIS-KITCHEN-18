import { createContext } from "react";
import type { UserDTO } from "@shared/api";

export interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  isOwner: boolean;
  /** Exchange a Google ID token for our session cookie. */
  signIn: (credential: string) => Promise<UserDTO>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Which door a window is signed in at. The kitchen and the shop hold separate
 * cookies on the server, and this says which of them a given window is using.
 */
export type SessionScope = "customer" | "kitchen";

const SCOPE_KEY = "aji-scope";

/** The dashboard and its login. Always the kitchen, whoever is looking. */
export const isKitchenPath = (pathname: string): boolean =>
  pathname === "/owner" || pathname.startsWith("/owner/") || pathname === "/owner-login";

/**
 * Read from `sessionStorage`, which is per window — not `localStorage`, which
 * every window shares.
 *
 * This is the whole point: Aaji can have the dashboard open in one window and
 * a customer can be shopping in another, and moving the dashboard window to
 * the home page keeps her signed in as Aaji there. Deciding the door from the
 * URL instead made both windows agree on whoever the home page belonged to,
 * which is not two independent sessions at all.
 */
export function readTabScope(): SessionScope {
  try {
    return sessionStorage.getItem(SCOPE_KEY) === "kitchen" ? "kitchen" : "customer";
  } catch {
    // Private mode, or storage blocked: the shop is the safe assumption.
    return "customer";
  }
}

export function writeTabScope(scope: SessionScope): void {
  try {
    sessionStorage.setItem(SCOPE_KEY, scope);
  } catch {
    // Nothing to do; the window just forgets when it closes.
  }
}

export const authKeys = { me: (scope: SessionScope) => ["auth", "me", scope] as const };
