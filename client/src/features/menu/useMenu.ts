import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { MenuItemDTO, MenuListResponse, MenuQuery } from "@shared/api";
import { api } from "@/lib/api";

export const menuKeys = {
  all: ["menu"] as const,
  list: (query: MenuQuery) => ["menu", "list", query] as const,
  detail: (id: string) => ["menu", "detail", id] as const,
};

export function useMenu(query: MenuQuery = {}) {
  return useQuery({
    queryKey: menuKeys.list(query),
    queryFn: () =>
      api.get<MenuListResponse>("/menu", {
        category: query.category,
        isVeg: query.isVeg,
        search: query.search,
      }),
    select: (data): MenuItemDTO[] => data.items,
    // Keep showing the previous results while a new filter loads, instead of
    // flashing the skeleton on every keystroke.
    placeholderData: keepPreviousData,
  });
}
