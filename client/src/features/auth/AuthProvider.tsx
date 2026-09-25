import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";
import type { UserDTO } from "@shared/api";
import { ApiError, api } from "@/lib/api";
import { forgetGoogleSelection } from "./googleIdentity";
import { AuthContext, authKeys, type AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // The session lives in an httpOnly cookie, so "am I signed in?" is a
  // question only the server can answer. A 401 here is a normal answer (signed
  // out), not an error to retry.
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await api.get<UserDTO>("/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const signIn = useMutation({
    mutationFn: (credential: string) => api.post<UserDTO>("/auth/google", { credential }),
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });

  const signOut = useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSuccess: async () => {
      forgetGoogleSelection();
      queryClient.setQueryData(authKeys.me, null);
      // Anything fetched as this user must go.
      await queryClient.invalidateQueries();
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
