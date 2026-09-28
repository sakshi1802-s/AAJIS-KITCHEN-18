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
 * Which door this part of the site is: the kitchen under /owner, the shop
 * everywhere else. Each has its own cookie on the server, so signing in to
 * one leaves the other exactly as it was.
 */
export type SessionScope = "customer" | "kitchen";

export const scopeForPath = (pathname: string): SessionScope =>
  pathname === "/owner" || pathname.startsWith("/owner/") || pathname === "/owner-login" ? "kitchen" : "customer";

export const authKeys = { me: (scope: SessionScope) => ["auth", "me", scope] as const };
