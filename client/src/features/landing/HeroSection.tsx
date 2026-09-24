import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useCart } from "@/features/cart/cartContext";
import { SteamWisps } from "./SteamWisps";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/plan", label: "Planner AI" },
  { to: "/menu", label: "Menu" },
  { to: "/cart", label: "Cart" },
];

/**
 * Section one, as drawn: photograph across the whole screen, the wordmark on
 * the top line with Sign in, a transparent navigation row spread right across
 * underneath it, and चटक / मटक! in the gap between the two thalis.
 */
export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const { itemCount } = useCart();

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative isolate min-h-svh w-full overflow-hidden bg-wood-deep">
      {/* Full-bleed, cropped but never stretched. */}
      <img
        src="/hero/ajji-thalis.webp"
        alt="Aji in a nauvari saree carrying two brass thalis of Maharashtrian food"
        className="absolute inset-0 size-full object-cover object-center"
        fetchPriority="high"
      />

      {/* Shade only at the very top, so the wordmark and nav read. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-35% to-black/30" />

      {/* Above the scrim so the shade can't wash the steam out, below the text. */}
      <SteamWisps />

      <div className="relative flex min-h-svh flex-col">
        {/* Top line: wordmark centred, Sign in in the corner, same row. */}
        <div className="relative flex items-center justify-center px-4 pt-5 sm:px-8 sm:pt-6">
          <motion.h1 {...rise(0.05)} className="text-center leading-none">
            <span
              lang="mr"
              className="font-display-mr text-[2rem] text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.8)] sm:text-4xl md:text-[2.75rem]"
            >
              आजी
            </span>
            {/* the S after the apostrophe, deliberately small */}
            <span className="font-royal text-lg font-bold text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl">
              ’S
            </span>{" "}
            <span className="font-royal text-2xl font-bold tracking-wide text-black [text-shadow:0_0_16px_rgba(255,255,255,0.9),0_0_34px_rgba(255,238,205,0.6)] sm:text-3xl md:text-4xl">
              Kitchen
            </span>
          </motion.h1>

          <div className="absolute top-1/2 right-4 -translate-y-1/2 sm:right-8">
            <AccountMenu onHero />
          </div>
        </div>

        {/* Navigation: no box, no background — just the labels, spread right
            across the screen, directly under the heading. */}
        <motion.nav {...rise(0.18)} aria-label="Main" className="mt-4 w-full px-6 sm:mt-6 sm:px-16 lg:px-28">
          <ul className="flex items-center justify-between gap-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="rounded-md px-1 py-1 font-royal text-sm font-semibold tracking-[0.12em] text-white uppercase outline-none transition-colors [text-shadow:0_2px_12px_rgba(0,0,0,0.9)] hover:text-gold focus-visible:ring-2 focus-visible:ring-white/70 sm:text-base"
                >
                  {item.label}
                  {item.to === "/cart" && itemCount > 0 && <span className="ml-1 text-gold">({itemCount})</span>}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* चटक मटक! — in the gap between the two thalis, sitting high.
            चटक leads; मटक! drops below it and to the right. */}
        <div className="flex flex-1 items-start justify-center px-4 pt-[9vh] sm:pt-[11vh]">
          <motion.p
            {...rise(0.42)}
            lang="mr"
            className="flex flex-col leading-[0.9] text-gold [text-shadow:0_5px_26px_rgba(0,0,0,0.9)] sm:translate-x-[7%]"
          >
            <span className="font-display-mr text-5xl sm:text-6xl md:text-7xl">चटक</span>
            <span className="mt-1 ml-12 font-display-mr text-3xl sm:ml-16 sm:text-4xl md:text-5xl">मटक!</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
