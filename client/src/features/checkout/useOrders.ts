import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderDTO, OrdersListResponse, PlaceOrderRequest } from "@shared/api";
import { menuKeys } from "@/features/menu/useMenu";
import { api } from "@/lib/api";

export const orderKeys = {
  all: ["orders"] as const,
  mine: ["orders", "mine"] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.mine,
    queryFn: () => api.get<OrdersListResponse>("/orders/me"),
    select: (data) => data.orders,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => api.get<OrderDTO>(`/orders/${orderId}`),
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceOrderRequest) => api.post<OrderDTO>("/orders", body),
    onSuccess: async () => {
      // Stock just moved, and there's a new order to list.
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.post<OrderDTO>(`/orders/${orderId}/cancel`),
    onSuccess: async (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      await queryClient.invalidateQueries({ queryKey: orderKeys.mine });
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}
