import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateReviewRequest, ReviewDTO, ReviewsListResponse } from "@shared/api";
import { api } from "@/lib/api";

export const reviewKeys = {
  all: ["reviews"] as const,
  published: ["reviews", "published"] as const,
  mine: ["reviews", "mine"] as const,
  queue: ["reviews", "queue"] as const,
};

/** The reviews Aaji has chosen to show. Public, so no sign-in needed. */
export function usePublishedReviews() {
  return useQuery({
    queryKey: reviewKeys.published,
    queryFn: () => api.get<ReviewsListResponse>("/reviews"),
    select: (data) => data.reviews,
    staleTime: 5 * 60_000,
  });
}

/** A customer's own reviews, so they can see whether one is up yet. */
export function useMyReviews(enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.mine,
    queryFn: () => api.get<ReviewsListResponse>("/reviews/me"),
    select: (data) => data.reviews,
    enabled,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => api.post<ReviewDTO>("/reviews", body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

/** Aaji's queue: everything, published or not. */
export function useAllReviews() {
  return useQuery({
    queryKey: reviewKeys.queue,
    queryFn: () => api.get<ReviewsListResponse>("/owner/reviews"),
    select: (data) => data.reviews,
  });
}

export function useSetReviewPublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.patch<ReviewDTO>(`/owner/reviews/${id}`, { isPublished }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
