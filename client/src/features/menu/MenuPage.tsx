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
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <header className="mb-7 text-center">
        <p lang="mr" className="font-display-mr text-3xl text-gold sm:text-4xl">
          आजीचा मेनू
        </p>
        <h1 className="mt-1 font-royal text-2xl font-bold tracking-wide text-cream sm:text-3xl">
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
