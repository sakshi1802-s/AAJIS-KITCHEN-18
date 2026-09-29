import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { UserDTO } from "@shared/api";
import { ApiError, api } from "@/lib/api";
import { forgetGoogleSelection } from "./googleIdentity";
import {
  AuthContext,
  authKeys,
  isKitchenPath,
  readTabScope,
  writeTabScope,
  type AuthContextValue,
} from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  // Which door THIS WINDOW is at. The dashboard pins a window to the kitchen;
  // anywhere else the window keeps the door it last signed in at, which is
  // what lets Aaji walk from the dashboard to the home page and still be
  // Aaji while a customer shops in another window.
  const scope = isKitchenPath(pathname) ? "kitchen" : readTabScope();

  useEffect(() => {
    if (isKitchenPath(pathname)) writeTabScope("kitchen");
  }, [pathname]);

  // The session lives in an httpOnly cookie, so "am I signed in?" is a
  // question only the server can answer. A 401 here is a normal answer (signed
  // out), not an error to retry.
  const me = useQuery({
    queryKey: authKeys.me(scope),
    queryFn: async () => {
      try {
        return await api.get<UserDTO>("/auth/me", { scope });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const signIn = useMutation({
    mutationFn: (credential: string) => api.post<UserDTO>("/auth/google", { credential, scope }),
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(scope), user),
  });

  const signOut = useMutation({
    mutationFn: () => api.post<void>(`/auth/logout?scope=${scope}`),
    onSuccess: async () => {
      forgetGoogleSelection();
      // This window goes back to being an ordinary shopper's.
      writeTabScope("customer");
      queryClient.setQueryData(authKeys.me(scope), null);
      // Anything fetched as this user must go — but only this door's.
      await queryClient.invalidateQueries({ queryKey: authKeys.me(scope) });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me.data ?? null,
      isLoading: me.isPending,
      isOwner: me.data?.role === "owner",
      signIn: (credential) => signIn.mutateAsync(credential),
      signOut: async () => {
        await signOut.mutateAsync();
      },
    }),
    [me.data, me.isPending, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
