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

export const authKeys = { me: ["auth", "me"] as const };
