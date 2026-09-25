import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MenuItemDTO,
  MenuItemInput,
  OrderDTO,
  OrdersListResponse,
  OwnerDecisionRequest,
  OwnerOrdersQuery,
  OwnerStatsDTO,
} from "@shared/api";
import { orderKeys } from "@/features/checkout/useOrders";
import { menuKeys } from "@/features/menu/useMenu";
import { api } from "@/lib/api";

export const ownerKeys = {
  all: ["owner"] as const,
  orders: (query: OwnerOrdersQuery) => ["owner", "orders", query] as const,
  stats: ["owner", "stats"] as const,
};

export function useOwnerOrders(query: OwnerOrdersQuery = {}) {
  return useQuery({
    queryKey: ownerKeys.orders(query),
    queryFn: () => api.get<OrdersListResponse>("/owner/orders", { status: query.status, date: query.date }),
    select: (data) => data.orders,
    // Aaji leaves this open on her phone; new orders should appear on their own.
    refetchInterval: 60_000,
  });
}

export function useOwnerStats() {
  return useQuery({
    queryKey: ownerKeys.stats,
    queryFn: () => api.get<OwnerStatsDTO>("/owner/stats"),
    refetchInterval: 60_000,
  });
}

export function useDecideOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OwnerDecisionRequest) => api.patch<OrderDTO>(`/owner/orders/${orderId}/status`, body),
    onSuccess: async (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      await queryClient.invalidateQueries({ queryKey: ownerKeys.all });
      // A decline hands stock back to the menu.
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

function useMenuMutation<TInput, TResult>(request: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

export const useCreateMenuItem = () =>
  useMenuMutation((body: MenuItemInput) => api.post<MenuItemDTO>("/owner/menu", body));

export const useUpdateMenuItem = () =>
  useMenuMutation(({ id, ...body }: Partial<MenuItemInput> & { id: string }) =>
    api.patch<MenuItemDTO>(`/owner/menu/${id}`, body),
  );

export const useDeleteMenuItem = () => useMenuMutation((id: string) => api.delete<void>(`/owner/menu/${id}`));
