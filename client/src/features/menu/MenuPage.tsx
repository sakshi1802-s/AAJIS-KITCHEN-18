import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CATEGORIES, type Category } from "@shared/api";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { MenuCard } from "./MenuCard";
import { MenuFilters } from "./MenuFilters";
import { MenuGridSkeleton } from "./MenuGridSkeleton";
import { useMenu } from "./useMenu";

const isCategory = (value: string | null): value is Category =>
  value !== null && (CATEGORIES as readonly string[]).includes(value);

/**
 * The public menu. Filters live in the URL (?category=sweets&veg=1&q=modak)
 * so a filtered view can be shared and the back button behaves.
 */
export function MenuPage() {
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get("category");
  const category = isCategory(categoryParam) ? categoryParam : undefined;
  const vegOnly = params.get("veg") === "1";
  const urlSearch = params.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const search = useDebouncedValue(searchInput.trim(), 300);

  // Push the debounced search into the URL.
  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set("q", search);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }, [search, setParams]);

  const updateParam = (key: string, value: string | undefined) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const clearFilters = () => {
    setSearchInput("");
    setParams({}, { replace: true });
  };

  const menu = useMenu({ category, isVeg: vegOnly ? true : undefined, search: search || undefined });
  const hasFilters = Boolean(category || vegOnly || search);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-4xl font-semibold text-maroon sm:text-5xl">The menu</h1>
        <p lang="mr" className="mt-1 text-xl text-muted-foreground">
          आजीचा मेनू
        </p>
        <p className="mt-3 text-muted-foreground">
          Everything is made to order in Aji's kitchen. Pick what you'd like and when you need it — she'll look
          at your order and confirm it herself.
        </p>
      </header>

      <MenuFilters
        category={category}
        onCategoryChange={(c) => updateParam("category", c)}
        vegOnly={vegOnly}
        onVegOnlyChange={(v) => updateParam("veg", v ? "1" : undefined)}
        search={searchInput}
        onSearchChange={setSearchInput}
      />

      <section className="mt-6" aria-labelledby="menu-results">
        <h2 id="menu-results" className="sr-only">
          Dishes
        </h2>

        {menu.isPending ? (
          <MenuGridSkeleton />
        ) : menu.isError ? (
          <ErrorState title="Couldn't load the menu" error={menu.error} onRetry={() => void menu.refetch()} />
        ) : menu.data.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No dishes match that" : "The menu is being written"}
            description={
              hasFilters
                ? search
                  ? `Nothing on the menu matches “${search}”. Try another name, or clear the filters.`
                  : "Nothing in this selection right now. Try another category."
                : "Aji hasn't added any dishes yet. Check back soon."
            }
            action={
              hasFilters && (
                <Button variant="outline" size="lg" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {menu.data.length} {menu.data.length === 1 ? "dish" : "dishes"}
            </p>
            <div
              className={cn(
                "grid grid-cols-1 gap-5 transition-opacity min-[520px]:grid-cols-2 lg:grid-cols-3",
                menu.isPlaceholderData && "opacity-60",
              )}
            >
              {menu.data.map((item, i) => (
                <MenuCard key={item.id} item={item} eagerImage={i < 2} action={<AddToCartButton item={item} />} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
