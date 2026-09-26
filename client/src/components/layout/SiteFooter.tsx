import { BrandMark } from "./BrandMark";

/**
 * The closing strip: the same wordmark as the header, her line under it, and
 * nothing else. Centred and quiet, so it reads as the end of the page rather
 * than a bar of leftovers.
 */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-gold/20 bg-black/45">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center">
        <BrandMark className="size-9" />

        <p className="leading-none">
          <span lang="mr" className="font-display-mr text-2xl text-gold">
            आजी
          </span>
          <span className="font-royal text-sm font-bold text-gold">’S</span>{" "}
          <span className="font-royal text-lg font-bold tracking-wide text-cream">Kitchen</span>
        </p>

        <p lang="mr" className="font-display-mr text-base text-cream/70">
          घरगुती चव, प्रेमाने
        </p>
      </div>
    </footer>
  );
}
