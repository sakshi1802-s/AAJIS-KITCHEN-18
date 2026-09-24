import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { SteamWisps } from "./SteamWisps";

const TAGLINE = "Bringing Aji's authentic Marathi food straight to your table";

/** Types the line out, a character at a time, once it appears. */
function TypedLine({ text, delayMs = 900 }: { text: string; delayMs?: number }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (reduceMotion) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      i += 1;
      setShown(i);
      if (i < text.length) timer = setTimeout(tick, 34);
    }, delayMs);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, delayMs, reduceMotion]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true">{text.slice(0, shown)}</span>
      {shown < text.length && (
        <span aria-hidden="true" className="ml-0.5 inline-block w-px animate-pulse bg-cream/80 align-middle">
          &nbsp;
        </span>
      )}
    </span>
  );
}

/**
 * Section one: the photograph across the whole screen, with चटक मटक! sitting
 * in the gap between the two thalis and a single line typing itself out
 * beneath. The wordmark and navigation come from the shared header, so they
 * are identical here and on every other page.
 */
export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-svh w-full overflow-hidden bg-wood-deep">
      <img
        src="/hero/ajji-thalis.webp"
        alt="Aji in a nauvari saree carrying two brass thalis of Maharashtrian food"
        className="absolute inset-0 size-full object-cover object-center"
        fetchPriority="high"
      />

      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-35% to-black/35" />

      <SteamWisps />

      {/* चटक मटक!, lower and larger, with the line underneath. */}
      <div className="relative flex min-h-svh items-center justify-center px-4 pt-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-[12vh] sm:mt-[14vh] sm:translate-x-[6%]"
        >
          <p lang="mr" className="flex flex-col leading-[0.88] text-gold [text-shadow:0_6px_30px_rgba(0,0,0,0.9)]">
            <span className="font-display-mr text-6xl sm:text-7xl md:text-8xl">चटक</span>
            <span className="mt-1.5 ml-14 font-display-mr text-4xl sm:ml-20 sm:text-5xl md:text-6xl">मटक!</span>
          </p>

          <p className="mt-4 max-w-xs text-sm font-medium text-cream/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.95)] sm:max-w-sm sm:text-base">
            <TypedLine text={TAGLINE} />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
