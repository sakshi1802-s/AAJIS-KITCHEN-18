import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { FlipBook, type FlipBookHandle } from "@/components/FlipBook";
import { Reveal } from "@/components/Reveal";

/** Four spreads: her photograph on the left, a short piece of her story on the right. */
const SPREADS = [
  {
    photo: "/aji/aaji.webp",
    marathi: "आजीच्या हातची चव",
    heading: "Forty years at the same stove",
    body: "Aaji has cooked for her family since she was nineteen. First for her own house, then for every wedding, haldi and Ganpati on the street.",
  },
  {
    photo: "/aji/thali-raised.webp",
    marathi: "घरचंच, सगळं",
    heading: "Nothing out of a packet",
    body: "The bhajani is ground at home, the masala is pounded and not bought, the ghee is her own, and the vegetables are picked the morning she cooks them.",
  },
  {
    photo: "/dishes/puran-poli-thali.webp",
    marathi: "एका वेळी एकच",
    heading: "One order at a time",
    body: "She reads and confirms every order herself, which is why the site asks her before it says yes. If she cannot do your day, she will tell you so.",
  },
  {
    photo: "/dishes/ukadiche-modak.webp",
    marathi: "सणासुदीला",
    heading: "For the days that matter",
    body: "Modak at Ganpati, faral tins at Diwali, puran poli at Holi, a full naivedya thali for a puja. Tell her the occasion and she will cook to it.",
  },
];

const FLIP_EVERY_MS = 6000;

/**
 * Section two: Aaji's story as a book that turns its own pages. Hovering or
 * focusing it stops the timer so a page can be finished, and anyone who asked
 * for less motion turns it by hand.
 */
export function AboutBook() {
  const bookRef = useRef<FlipBookHandle>(null);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  // Narrow screens show one page at a time, so the timer must step by one.
  const [step, setStep] = useState(2);

  const pageCount = SPREADS.length * 2;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setTimeout(() => {
      const api = bookRef.current?.pageFlip();
      if (!api) return;
      if (page + step >= pageCount) api.flip(0);
      else api.flipNext();
    }, FLIP_EVERY_MS);

    return () => clearTimeout(id);
  }, [page, paused, step, pageCount]);

  return (
    <section id="about-aji" className="relative scroll-mt-4 overflow-hidden py-20 sm:py-24">
      <Reveal className="mx-auto mb-10 w-full max-w-3xl px-4 text-center">
        <p lang="mr" className="font-display-mr text-3xl text-gold sm:text-4xl">
          आजीबद्दल
        </p>
        <h2 className="mt-1 font-royal text-3xl font-bold tracking-wide text-cream sm:text-4xl">
          Her story, page by page
        </h2>
      </Reveal>

      {/* Deliberately outside <Reveal>: the flip library measures the book on
          mount, and a parent mid-transform gives it the wrong size. */}
      <div
        className="flex justify-center px-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <FlipBook
          ref={bookRef}
          width={430}
          height={560}
          size="stretch"
          minWidth={280}
          maxWidth={520}
          minHeight={380}
          maxHeight={660}
          maxShadowOpacity={0.4}
          flippingTime={900}
          mobileScrollSupport
          className="aaji-book"
          onFlip={(event) => setPage(event.data)}
          onChangeOrientation={(event) => setStep(event.data === "landscape" ? 2 : 1)}
        >
          {SPREADS.flatMap((spread, i) => [
            <div key={`photo-${spread.photo}`} className="book-page book-page--left">
              <div className="flex h-full flex-col p-5 sm:p-7">
                <img
                  src={spread.photo}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="min-h-0 w-full flex-1 rounded-sm object-cover shadow-[0_6px_18px_rgba(80,45,15,0.3)]"
                />
                <p lang="mr" className="mt-4 text-center font-display-mr text-2xl text-[#9a3412]">
                  {spread.marathi}
                </p>
              </div>
            </div>,

            <div key={`text-${spread.photo}`} className="book-page book-page--right">
              <div className="flex h-full flex-col justify-center p-7 sm:p-9">
                <h3 className="font-royal text-2xl leading-snug font-bold text-[#4a2410] sm:text-3xl">
                  {spread.heading}
                </h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-[#5b3620]">{spread.body}</p>

                {i === SPREADS.length - 1 && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/menu"
                      className="rounded-full bg-[#9a3412] px-6 py-2.5 font-royal text-sm font-bold tracking-wide text-[#f8ecd5] transition-colors hover:bg-[#7c2d12]"
                    >
                      See the menu
                    </Link>
                    <Link
                      to="/plan"
                      className="rounded-full border border-[#9a3412]/50 px-6 py-2.5 font-royal text-sm font-bold tracking-wide text-[#7c2d12] transition-colors hover:bg-[#9a3412]/10"
                    >
                      Plan an occasion
                    </Link>
                  </div>
                )}

                <span className="mt-auto pt-6 text-right font-script text-sm text-[#5b3620]/60">
                  {i + 1} of {SPREADS.length}
                </span>
              </div>
            </div>,
          ])}
        </FlipBook>
      </div>
    </section>
  );
}
