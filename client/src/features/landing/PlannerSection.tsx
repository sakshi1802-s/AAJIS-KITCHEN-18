import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BrassThali } from "./BrassThali";

/**
 * Section three: an empty thali resting on the table, which slides in from
 * the left as you reach it while the words fade up beside it.
 *
 * "Planner AI" in the navigation tells a first-time customer nothing, so this
 * says what it is and hands them the button. Like the book, it watches itself
 * into view and plays again if you come back to it.
 */
export function PlannerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
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
      className="relative flex min-h-[72svh] items-center justify-center overflow-hidden px-4 py-14"
      aria-labelledby="planner-heading"
    >
      <div
        ref={sectionRef}
        className="grid w-full max-w-4xl items-center gap-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-12"
      >
        {/* Comes in from the left and settles, the way a plate is set down. */}
        <BrassThali
          className={`mx-auto w-[min(72vw,20rem)] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            shown ? "translate-x-0 rotate-0 opacity-100" : "-translate-x-[130%] -rotate-12 opacity-0"
          }`}
        />

        <div
          className={`text-center transition-all delay-200 duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:text-left ${
            shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p lang="mr" className="font-display-mr text-2xl text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.9)] sm:text-3xl">
            काय मागवायचं ठरत नाहीये?
          </p>
          <h2
            id="planner-heading"
            className="mt-1 font-royal text-3xl font-bold tracking-wide text-cream [text-shadow:0_2px_14px_rgba(0,0,0,0.95)] sm:text-4xl"
          >
            Confused what to order?
          </h2>

          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-cream/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.95)]">
            Tell the Planner AI who you're feeding and what the day is, and it lays out a spread from Aaji's own menu.
            Only what she is cooking, only at her prices. Change anything before you send it to her.
          </p>

          <Link
            to="/plan"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#9a3412] px-8 py-3.5 font-royal text-base font-bold tracking-wide text-[#f8ecd5] shadow-[0_10px_30px_rgba(0,0,0,0.45)] outline-none transition-colors hover:bg-[#7c2d12] focus-visible:ring-3 focus-visible:ring-gold/50"
          >
            <Sparkles className="size-5" aria-hidden="true" /> Use the Planner AI
          </Link>
        </div>
      </div>
    </section>
  );
}
