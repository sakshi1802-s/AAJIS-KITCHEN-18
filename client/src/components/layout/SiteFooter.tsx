import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="size-6" />
          <span>
            <span lang="mr" className="font-display-mr text-base text-terracotta">
              आजी
            </span>{" "}
            Kitchen · <span lang="mr">घरगुती चव, प्रेमाने</span>
          </span>
        </div>
        <p>Home-cooked, made to order. Every order is confirmed by Aji herself.</p>
      </div>
    </footer>
  );
}
