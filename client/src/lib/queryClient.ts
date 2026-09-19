import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Freshness without websockets (roadmap §3): data is fresh for 30s and
      // refetched when the customer comes back to the tab. Correctness is the
      // server's job at checkout, not the display's.
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Retry network blips and 5xx, never 4xx — those won't fix themselves.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
