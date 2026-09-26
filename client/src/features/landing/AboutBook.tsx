import { useEffect, useRef, useState, type ReactNode } from "react";
import { FlipBook, type FlipBookHandle } from "@/components/FlipBook";

/** Four spreads: a photograph on the left, a short piece of her story on the right. */
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
    photo: "/aji/carrying.webp",
    marathi: "आजोबांची साथ",
    heading: "Aajoba does the running about",
    body: "He reads her the orders off the phone, goes down to the market at six, turns the grinding stone when her wrist tires, and walks every tiffin out to the gate himself.",
  },
  {
    photo: "/dishes/ukadiche-modak.webp",
    marathi: "सणासुदीला",
    heading: "For the days that matter",
    body: "Modak at Ganpati, faral tins at Diwali, puran poli at Holi, a full naivedya thali for a puja. Tell her the occasion and she will cook to it.",
  },
];

/** It opens as soon as it is up; only the reading pace is leisurely. */
const OPEN_AFTER_MS = 120;
const TURN_EVERY_MS = 4600;

/** A page must be a plain element: the flip library clones it to attach a ref. */
function page({ key, side, children }: { key: string; side: "left" | "right"; children: ReactNode }) {
  return (
    <div key={key} className={`book-page book-page--${side}`}>
      {children}
    </div>
  );
}

/**
 * Section two: her story as a book resting on the table. Closed and lying
 * flat until you scroll to it, then it stands up, opens at once and reads
 * itself through, shuts and lies back down once you have gone past. The pages
 * can also be turned by hand: click the right half to go on, the left to go
 * back.
 */
export function AboutBook() {
  const bookBoxRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle>(null);
  const [standing, setStanding] = useState(false);
  const [page_, setPage] = useState(0);
  // A narrow screen shows one page at a time, so the timer steps by one.
  const [step, setStep] = useState(2);

  const pageCount = SPREADS.length * 2 + 2;

  useEffect(() => {
    const element = bookBoxRef.current;
    if (!element) return;

    // Watch the book itself, not the section around it. The section is taller
    // than a laptop window, so a ratio of it can never reach a high threshold
    // and the book would never stand up.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry && entry.intersectionRatio >= 0.35);
        setStanding(visible);
        if (!visible) {
          // Shut it as it lies back down, so it is closed the next time it
          // comes up. No animation: nobody is looking at it.
          bookRef.current?.pageFlip()?.turnToPage(0);
          setPage(0);
        }
      },
      { threshold: [0, 0.35, 1] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!standing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setTimeout(
      () => {
        const api = bookRef.current?.pageFlip();
        if (!api) return;
        if (page_ + step >= pageCount) api.flip(0);
        else api.flipNext();
      },
      page_ === 0 ? OPEN_AFTER_MS : TURN_EVERY_MS,
    );

    return () => clearTimeout(id);
  }, [standing, page_, step, pageCount]);

  return (
    <section id="about-aji" className="relative flex min-h-[88svh] items-center justify-center px-4 py-10">
      {/* A definite width: with size="stretch" the book measures its parent,
          and a shrink-to-fit parent collapses it to the minimum. */}
      <div ref={bookBoxRef} className="relative w-[min(90vw,44rem)]">
        {/* The shadow it casts on the table: wide and soft while it lies flat,
            tight underneath once it is upright. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-6 mx-auto h-10 rounded-[50%] bg-black/55 blur-2xl transition-all duration-[520ms] ${
            standing ? "w-3/4 opacity-60" : "w-[115%] opacity-80"
          }`}
        />

        <div
          className="transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] [filter:drop-shadow(0_16px_26px_rgba(0,0,0,0.55))]"
          style={{
            transform: standing
              ? "perspective(1600px) rotateX(7deg) rotateZ(-1.5deg) scale(1)"
              : "perspective(1600px) rotateX(64deg) rotateZ(-9deg) scale(0.74) translateY(8%)",
          }}
        >
          <FlipBook
            ref={bookRef}
            width={360}
            height={470}
            size="stretch"
            minWidth={230}
            maxWidth={400}
            minHeight={300}
            maxHeight={520}
            showCover
            maxShadowOpacity={0.5}
            flippingTime={620}
            onFlip={(event) => setPage(event.data)}
            onChangeOrientation={(event) => setStep(event.data === "landscape" ? 2 : 1)}
          >
            {[
              <div key="cover" className="book-page book-page--hard relative" data-density="hard">
                {/* Cloth, then a gold rule inside it, the way a bound book is. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,rgba(255,220,150,0.16),transparent_62%)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 to-transparent"
                />
                <div className="relative flex h-full flex-col items-center justify-center gap-4 p-7 text-center">
                  <span aria-hidden="true" className="absolute inset-4 rounded-md border border-[#fbbf24]/45" />
                  <span aria-hidden="true" className="absolute inset-[1.15rem] rounded-sm border border-[#fbbf24]/20" />

                  <img src="/logo/aji-logo.webp" alt="" className="size-16 rounded-full opacity-95" />
                  <p lang="mr" className="font-display-mr text-3xl leading-tight text-[#fbbf24]">
                    आजीची गोष्ट
                  </p>
                  <span className="h-px w-14 bg-[#fbbf24]/50" />
                  <p className="font-script text-base text-[#f8ecd5]/85">Her story, page by page</p>
                </div>
              </div>,

              ...SPREADS.flatMap((spread) => [
                page({
                  key: `photo-${spread.photo}`,
                  side: "left",
                  children: (
                    <div className="flex h-full flex-col p-4 sm:p-5">
                      <figure className="relative min-h-0 w-full flex-1">
                        <img
                          src={spread.photo}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-[6%] size-[88%] rounded-lg object-cover"
                        />
                        <img
                          src="/textures/page-frame.png"
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 size-full select-none"
                        />
                      </figure>
                      <p lang="mr" className="mt-3 text-center font-display-mr text-xl text-[#9a3412]">
                        {spread.marathi}
                      </p>
                    </div>
                  ),
                }),

                page({
                  key: `text-${spread.photo}`,
                  side: "right",
                  children: (
                    <div className="flex h-full flex-col justify-center p-6 sm:p-7">
                      <h3 className="font-royal text-xl leading-snug font-bold text-[#4a2410] sm:text-2xl">
                        {spread.heading}
                      </h3>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-[#5b3620]">{spread.body}</p>
                    </div>
                  ),
                }),
              ]),

              <div key="back" className="book-page book-page--hard" data-density="hard">
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <p lang="mr" className="font-display-mr text-2xl text-[#fbbf24]">
                    घरगुती चव, प्रेमाने
                  </p>
                </div>
              </div>,
            ]}
          </FlipBook>
        </div>
      </div>
    </section>
  );
}
