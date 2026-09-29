import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, type Category, type MenuItemDTO } from "@shared/api";
import { FlipBook, type FlipBookHandle } from "@/components/FlipBook";
import { VegMark } from "@/components/VegMark";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAvailability } from "./availability";

/** Four dishes a page, so a spread reads as eight, the size of a real page. */
const PER_PAGE = 4;

function Dish({ item }: { item: MenuItemDTO }) {
  const { canOrder } = getAvailability(item);

  return (
    <li className="flex min-h-0 flex-1 items-start gap-3 border-b border-[#9a3412]/20 py-2.5 last:border-b-0">
      <img
        src={item.imageUrl ?? "/logo/aji-logo.webp"}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          "size-14 shrink-0 rounded-md border border-[#9a3412]/25 object-cover shadow-[0_3px_8px_rgba(80,45,15,0.25)] sm:size-16",
          !canOrder && "grayscale-[60%]",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          <VegMark isVeg={item.isVeg} className="mt-1 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-royal text-[0.95rem] leading-tight font-bold text-[#4a2410]">{item.name}</h3>
            {item.nameMarathi && (
              <p lang="mr" className="font-display-mr text-sm leading-tight text-[#9a3412]">
                {item.nameMarathi}
              </p>
            )}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-[#5b3620]/85">{item.description}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-royal text-sm font-bold text-[#7c2d12]">{formatINR(item.price)}</span>
        <span className="text-[10px] text-[#5b3620]/70">{item.unitLabel}</span>
        <AddToCartButton item={item} />
      </div>
    </li>
  );
}

/**
 * A page, built as a plain element rather than a component on purpose: the
 * flip library clones each child and hands it a ref, and a ref only lands on
 * a DOM node. Wrap a page in a component and the book never starts.
 */
function page({ key, side, children }: { key: string; side: "left" | "right"; children: ReactNode }) {
  return (
    <div key={key} className={cn("book-page", side === "left" ? "book-page--left" : "book-page--right")}>
      <div className="flex h-full flex-col px-6 py-6 sm:px-8">{children}</div>
    </div>
  );
}

/** Builds the book once: cover, a divider and dish pages per section, back cover. */
function buildPages(items: MenuItemDTO[]) {
  const pages: ReactNode[] = [];
  const starts: Partial<Record<Category, number>> = {};

  const blank = (key: string) => (
    <div key={key} className="book-page">
      <div className="h-full" />
    </div>
  );

  pages.push(
    <div key="cover" className="book-page book-page--hard" data-density="hard">
      <div className="flex h-full flex-col items-center justify-center gap-3 border-8 border-double border-[#f8ecd5]/40 p-8 text-center">
        <img src="/logo/aji-logo.webp" alt="" className="size-20 rounded-full" />
        <p lang="mr" className="font-display-mr text-4xl text-[#fbbf24]">
          आजीचं पाककृती पुस्तक
        </p>
        <h2 className="font-royal text-xl font-bold tracking-[0.2em] text-[#f8ecd5]">AAJI&rsquo;S KITCHEN</h2>
        <span className="mt-2 h-px w-24 bg-[#f8ecd5]/50" />
        <p className="font-script text-lg text-[#f8ecd5]/80">Cooked to order, one house at a time</p>
      </div>
    </div>,
  );

  for (const category of CATEGORIES) {
    const dishes = items.filter((item) => item.category === category);
    if (dishes.length === 0) continue;

    // A section always opens on a left page, the way a chapter does.
    if (pages.length % 2 === 0) pages.push(blank(`pad-${category}`));
    starts[category] = pages.length;

    const label = CATEGORY_LABELS[category];
    pages.push(
      page({
        key: `divider-${category}`,
        side: "left",
        children: (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="h-px w-16 bg-[#9a3412]/40" />
            <p lang="mr" className="mt-5 font-display-mr text-4xl text-[#9a3412]">
              {label.mr}
            </p>
            <h2 className="mt-3 font-royal text-2xl font-bold tracking-wide text-[#4a2410]">{label.en}</h2>
            <p className="mt-4 font-script text-lg text-[#5b3620]/75">
              {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}
            </p>
            <span className="mt-5 h-px w-16 bg-[#9a3412]/40" />
          </div>
        ),
      }),
    );

    for (let i = 0; i < dishes.length; i += PER_PAGE) {
      const slice = dishes.slice(i, i + PER_PAGE);
      const side = pages.length % 2 === 0 ? "left" : "right";
      const pageNumber = pages.length;
      pages.push(
        page({
          key: `${category}-${i}`,
          side,
          children: (
            <>
              <header className="mb-1 flex items-baseline justify-between border-b-2 border-[#9a3412]/30 pb-1.5">
                <span className="font-royal text-[11px] tracking-[0.18em] text-[#9a3412] uppercase">{label.en}</span>
                <span className="font-script text-sm text-[#5b3620]/60">{pageNumber}</span>
              </header>
              <ul className="flex min-h-0 flex-1 flex-col">
                {slice.map((item) => (
                  <Dish key={item.id} item={item} />
                ))}
              </ul>
            </>
          ),
        }),
      );
    }
  }

  // The back cover stands alone, so it has to fall on a left page.
  if (pages.length % 2 === 0) pages.push(blank("pad-end"));
  pages.push(
    <div key="back" className="book-page book-page--hard" data-density="hard">
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p lang="mr" className="font-display-mr text-3xl text-[#fbbf24]">
          धन्यवाद
        </p>
        <p className="max-w-[16rem] text-sm text-[#f8ecd5]/85">
          Aaji reads every order herself and confirms it before she starts cooking.
        </p>
      </div>
    </div>,
  );

  return { pages, starts };
}

/**
 * The shape of one page. The flip library works out a page's height from its
 * width and this ratio, so a phone showing a single page needs a tall, narrow
 * page or four dishes will not fit on it.
 */
const SHAPE = {
  wide: { width: 520, height: 540 },
  narrow: { width: 360, height: 520 },
};

function useIsWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = () => setWide(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return wide;
}

/**
 * The sections, as a ribbon of tabs down the left edge of the book — the way
 * a recipe book has tabs cut into its pages, rather than a row of pills that
 * could belong to any site.
 */
const TAB =
  "group relative flex w-full items-center gap-3 rounded-l-lg border-y border-l py-3 pr-3 pl-4 text-left font-royal text-sm font-semibold tracking-wide transition-all outline-none focus-visible:ring-3 focus-visible:ring-gold/40";
const TAB_ON = "border-[#9a3412]/50 bg-[#e8d5b0] text-[#4a2410] shadow-[0_6px_18px_rgba(0,0,0,0.4)]";
const TAB_OFF = "border-transparent bg-black/35 text-cream/85 hover:bg-black/50 hover:pl-5";

/**
 * The menu as Aaji's own recipe book: pick a section and the book turns to it.
 * Nothing else on the page moves.
 */
export function CookbookMenu({ items }: { items: MenuItemDTO[] }) {
  const bookRef = useRef<FlipBookHandle>(null);
  const [page, setPage] = useState(0);
  const wide = useIsWide();
  const shape = wide ? SHAPE.wide : SHAPE.narrow;

  // Built once per menu. Keeping this identity stable matters: the flip
  // library rebuilds every page whenever its children change.
  const { pages, starts } = useMemo(() => buildPages(items), [items]);

  const sections = CATEGORIES.filter((category) => starts[category] !== undefined);
  // Which section the reader is in, so the buttons follow the book even when
  // the pages are turned by hand.
  const current = page === 0 ? undefined : sections.filter((c) => page >= (starts[c] ?? 0)).at(-1);

  const goTo = (target: number) => bookRef.current?.pageFlip()?.flip(target);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-start justify-center gap-0">
        <div
          role="group"
          aria-label="Jump to a section"
          className="mt-10 flex w-[8.5rem] shrink-0 flex-col gap-1.5 sm:w-[11rem]"
        >
          <button
            type="button"
            aria-pressed={page === 0}
            onClick={() => goTo(0)}
            className={cn(TAB, page === 0 ? TAB_ON : TAB_OFF)}
          >
            <span className="h-6 w-0.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
            All
          </button>
          {sections.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={current === category}
              onClick={() => goTo(starts[category] ?? 0)}
              className={cn(TAB, current === category ? TAB_ON : TAB_OFF)}
            >
              <span className="h-6 w-0.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
              <span className="min-w-0 leading-tight">{CATEGORY_LABELS[category].en}</span>
            </button>
          ))}
        </div>

        <FlipBook
        // The page shape is fixed when the book is built, so a change of
        // shape has to build a new one.
        key={wide ? "wide" : "narrow"}
        ref={bookRef}
        width={shape.width}
        height={shape.height}
        size="stretch"
        minWidth={280}
        maxWidth={560}
        minHeight={380}
        maxHeight={600}
        showCover
        maxShadowOpacity={0.5}
        flippingTime={800}
        mobileScrollSupport
        // Click the right half of the book to go on, the left half to go back.
        // Clicks on links and buttons are forwarded instead, so tapping Add
        // never turns the page.
        className="cookbook"
        onFlip={(event) => setPage(event.data)}
      >
        {pages}
        </FlipBook>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-black/30 text-cream transition-colors hover:bg-black/45 focus-visible:ring-3 focus-visible:ring-gold/40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-script text-sm text-cream/75 tabular-nums" aria-live="polite">
          Page {page + 1} of {pages.length}
        </span>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-black/30 text-cream transition-colors hover:bg-black/45 focus-visible:ring-3 focus-visible:ring-gold/40"
          aria-label="Next page"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
