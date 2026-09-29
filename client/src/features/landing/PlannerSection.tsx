import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

/**
 * Section three: an engraved copper thali lying face-up on the table, with
 * the words written inside it.
 *
 * The plate is a real one, cut out of its photograph by
 * `server/scripts/dev/cutPlate.py` and taken down a fifth in brightness so
 * the words sit on it. Out of view it rests almost flat and
 * small, the way a plate sits on a table; as you reach it, it lifts to face
 * you and grows. It turns slowly all the while — the words do not, because a
 * turning sentence cannot be read. Like the book, it plays again if you come
 * back to it.
 */
export function PlannerSection() {
  const plateRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = plateRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShown(Boolean(entry && entry.intersectionRatio >= 0.3)),
      { threshold: [0, 0.3, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative flex min-h-[92svh] items-center justify-center px-4 py-14"
      aria-labelledby="planner-heading"
    >
      <div
        ref={plateRef}
        className="relative aspect-[363/370] w-[min(94vw,38rem)] transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: shown
            ? "perspective(1500px) rotateX(0deg) scale(1)"
            : "perspective(1500px) rotateX(66deg) scale(0.6)",
        }}
      >
        <img
          src="/textures/copper-thali.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="thali-turn size-full drop-shadow-[0_26px_38px_rgba(0,0,0,0.6)] select-none"
        />

        {/* Inside the well, and never turning with the plate. */}
        <div
          className={`absolute inset-[22%] flex flex-col items-center justify-center gap-1 text-center transition-opacity delay-300 duration-700 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* The centre of the plate is engraved; this lifts the words off it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -inset-y-6 rounded-[50%] bg-[radial-gradient(62%_62%_at_50%_50%,rgba(34,19,5,0.62),rgba(34,19,5,0.34)_60%,transparent_84%)] blur-[3px]"
          />

          <p
            lang="mr"
            className="relative font-display-mr text-xl text-[#ffe9bd] [text-shadow:0_2px_10px_rgba(0,0,0,0.95)] sm:text-2xl"
          >
            काय मागवायचं ठरत नाहीये?
          </p>
          <h2
            id="planner-heading"
            className="relative font-royal text-xl leading-tight font-bold tracking-wide text-[#fff6e2] [text-shadow:0_2px_10px_rgba(0,0,0,0.95)] sm:text-2xl"
          >
            Confused what to order?
          </h2>
          <p className="relative mt-1 max-w-[17rem] text-[0.82rem] leading-snug text-[#f6e3c4] [text-shadow:0_2px_8px_rgba(0,0,0,0.95)] sm:max-w-[21rem] sm:text-sm">
            Tell the Planner AI who you're feeding and what day it is. It lays out a spread from Aaji's own menu, at
            her prices.
          </p>

          <Link
            to="/plan"
            className="relative mt-3 inline-flex items-center gap-2 rounded-full bg-[#9a3412] px-5 py-2.5 font-royal text-sm font-bold tracking-wide text-[#f8ecd5] shadow-[0_8px_22px_rgba(0,0,0,0.55)] outline-none transition-colors hover:bg-[#7c2d12] focus-visible:ring-3 focus-visible:ring-gold/50 sm:px-6 sm:text-base"
          >
            <Sparkles className="size-4 sm:size-5" aria-hidden="true" /> Use the Planner AI
          </Link>
        </div>
      </div>
    </section>
  );
}
