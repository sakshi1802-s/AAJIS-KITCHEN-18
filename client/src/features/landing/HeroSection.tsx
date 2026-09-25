import { motion, useReducedMotion } from "motion/react";
import { SteamWisps } from "./SteamWisps";
import { WrittenLine } from "./WrittenLine";

const TAGLINE = "Bringing Aaji's authentic gaavran जेवण, cooked the way she always has, straight to your ताट...";

/**
 * Section one: the photograph across the whole screen, with चटक मटक! in the
 * gap between the two thalis and one written line beneath it. The wordmark
 * and navigation come from the shared header.
 */
export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-svh w-full overflow-hidden bg-wood-deep">
      <img
        src="/hero/ajji-thalis.webp"
        alt="Aaji in a nauvari saree carrying two brass thalis of Maharashtrian food"
        className="absolute inset-0 size-full object-cover object-center"
        fetchPriority="high"
      />

      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-35% to-black/35" />

      <SteamWisps />

      <div className="relative flex min-h-svh items-center justify-center px-4 pt-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-[12vh] sm:mt-[14vh] sm:translate-x-[16%]"
        >
          {/* A soft warm light behind the words, so they lift off the photo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 rounded-full bg-[radial-gradient(58%_58%_at_45%_45%,rgba(255,206,110,0.5),rgba(255,176,64,0.24)_48%,transparent_74%)] blur-3xl"
          />

          <p lang="mr" className="flex flex-col leading-[0.88] text-gold [text-shadow:0_4px_26px_rgba(0,0,0,0.8),0_0_28px_rgba(255,206,120,0.65),0_0_70px_rgba(255,180,70,0.45)]">
            <span className="font-display-mr text-6xl sm:text-7xl md:text-8xl">चटक</span>
            <span className="mt-1.5 ml-14 font-display-mr text-4xl sm:ml-20 sm:text-5xl md:text-6xl">मटक!</span>
          </p>

          {/* Fixed height: the line draws itself without nudging anything. */}
          <p className="mt-4 min-h-[5rem] max-w-md font-script text-lg italic text-cream [text-shadow:0_2px_14px_rgba(0,0,0,0.95)] sm:text-xl">
            <WrittenLine text={TAGLINE} duration={4200} />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
