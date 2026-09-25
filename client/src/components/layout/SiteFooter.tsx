import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-gold/20 bg-black/35">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-7 text-sm text-cream/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="size-6" />
          <span>
            <span lang="mr" className="font-display-mr text-base text-gold">
              आजी
            </span>{" "}
            <span className="font-royal tracking-wide">Kitchen</span> ·{" "}
            <span lang="mr">घरगुती चव, प्रेमाने</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
