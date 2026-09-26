import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { CookbookMenu } from "./CookbookMenu";
import { useMenu } from "./useMenu";

/**
 * The whole menu in one place, as Aaji's recipe book. The section buttons turn
 * the pages, so there is nothing to filter and nothing to keep in the URL.
 */
export function MenuPage() {
  const menu = useMenu();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-1 pb-8">
      {/* One compact line, so the book itself sits high on the screen. */}
      <header className="mb-3 flex items-baseline justify-center gap-3">
        <p lang="mr" className="font-display-mr text-2xl text-gold sm:text-3xl">
          आजीचा मेनू
        </p>
        <h1 className="font-royal text-sm font-bold tracking-wide text-cream/80 sm:text-base">
          Turn the page, pick a dish
        </h1>
      </header>

      {menu.isPending ? (
        <div className="flex justify-center">
          <Skeleton className="h-[620px] w-full max-w-[1080px] rounded-sm" />
        </div>
      ) : menu.isError ? (
        <ErrorState title="Couldn't load the menu" error={menu.error} onRetry={() => void menu.refetch()} />
      ) : menu.data.length === 0 ? (
        <EmptyState
          title="The menu is being written"
          description="Aaji hasn't added any dishes yet. Check back soon."
        />
      ) : (
        <CookbookMenu items={menu.data} />
      )}
    </div>
  );
}
