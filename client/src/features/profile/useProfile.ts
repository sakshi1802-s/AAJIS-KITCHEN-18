import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddressInput, UpdateMeRequest, UserDTO } from "@shared/api";
import { authKeys } from "@/features/auth/authContext";
import { api } from "@/lib/api";

/** Every profile change returns the whole user, so we just replace the cache. */
function useUserMutation<TInput>(request: (input: TInput) => Promise<UserDTO>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });
}

export const useUpdateProfile = () => useUserMutation((body: UpdateMeRequest) => api.patch<UserDTO>("/users/me", body));

export const useAddAddress = () =>
  useUserMutation((body: AddressInput) => api.post<UserDTO>("/users/me/addresses", body));

export const useRemoveAddress = () =>
  useUserMutation((addressId: string) => api.delete<UserDTO>(`/users/me/addresses/${addressId}`));
