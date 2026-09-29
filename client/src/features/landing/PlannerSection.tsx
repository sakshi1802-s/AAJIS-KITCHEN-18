import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CopperThali } from "./CopperThali";

/**
 * Section three: a copper thali lying face-up on the table, with the words
 * written inside it.
 *
 * Out of view it rests almost flat and small, the way a plate sits on a
 * table. As you reach it, it lifts to face you and grows. The plate itself
 * turns slowly all the while; the words do not, because a turning sentence
 * cannot be read. Like the book, it plays again if you come back to it.
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
      className="relative flex min-h-[86svh] items-center justify-center px-4 py-14"
      aria-labelledby="planner-heading"
    >
      <div
        ref={plateRef}
        className="relative aspect-square w-[min(88vw,30rem)] transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: shown
            ? "perspective(1400px) rotateX(0deg) scale(1)"
            : "perspective(1400px) rotateX(68deg) scale(0.62)",
        }}
      >
        <CopperThali className="thali-turn size-full drop-shadow-[0_22px_34px_rgba(0,0,0,0.55)]" />

        {/* Inside the plate, and never turning with it. */}
        <div
          className={`absolute inset-[21%] flex flex-col items-center justify-center gap-1 text-center transition-opacity delay-300 duration-700 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          <p lang="mr" className="font-display-mr text-xl text-[#ffe9bd] [text-shadow:0_2px_10px_rgba(0,0,0,0.85)] sm:text-2xl">
            काय मागवायचं ठरत नाहीये?
          </p>
          <h2
            id="planner-heading"
            className="font-royal text-xl leading-tight font-bold tracking-wide text-[#fff6e2] [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] sm:text-2xl"
          >
            Confused what to order?
          </h2>
          <p className="mt-1 max-w-[16rem] text-[0.82rem] leading-snug text-[#f6e3c4]/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.9)] sm:max-w-[19rem] sm:text-sm">
            Tell the Planner AI who you're feeding and what day it is. It lays out a spread from Aaji's own menu, at
            her prices.
          </p>

          <Link
            to="/plan"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#9a3412] px-5 py-2.5 font-royal text-sm font-bold tracking-wide text-[#f8ecd5] shadow-[0_8px_22px_rgba(0,0,0,0.5)] outline-none transition-colors hover:bg-[#7c2d12] focus-visible:ring-3 focus-visible:ring-gold/50 sm:px-6 sm:text-base"
          >
            <Sparkles className="size-4 sm:size-5" aria-hidden="true" /> Use the Planner AI
          </Link>
        </div>
      </div>
    </section>
  );
}
