import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useCart } from "@/features/cart/cartContext";
import { cn } from "@/lib/utils";
import { SteamWisps } from "./SteamWisps";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/plan", label: "Planner AI" },
  { to: "/menu", label: "Menu" },
  { to: "/cart", label: "Cart" },
];

/**
 * The photograph is the page. Everything sits on top of it: the आजी Kitchen
 * wordmark, plain-text navigation with no boxes, and the चटक मटक line placed
 * in the gap between the two thalis, near her shoulder.
 */
export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const { itemCount } = useCart();

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative isolate min-h-[92svh] w-full overflow-hidden bg-wood-deep">
      {/* The photo itself — never cropped by CSS in a way that loses her hands. */}
      <img
        src="/hero/ajji-thalis.webp"
        alt="Aji in a nauvari saree carrying two brass thalis of Maharashtrian food"
        // Centred at every width: the steam layer maps its wisps through the
        // same centred-cover maths, so any other focal point would put the
        // steam off its plate.
        className="absolute inset-0 size-full object-cover object-center"
        fetchPriority="high"
      />

      {/* Just enough shade for the text to read, top and bottom only. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/60"
      />

      {/* Above the scrim — otherwise the shade washes the steam out — and
          still below the text, which sits in the relative block after it. */}
      <SteamWisps />

      <div className="relative flex min-h-[92svh] flex-col">
        {/* Sign in sits alone in the corner. */}
        <div className="flex justify-end px-4 pt-4 sm:px-8">
          <div className="[&_button]:text-white/90 [&_button]:hover:bg-white/15">
            <AccountMenu onHero />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center px-4 pt-6 sm:pt-10">
          <motion.h1 {...rise(0.05)} className="text-center leading-none">
            <span
              lang="mr"
              className="font-display-mr text-6xl text-gold drop-shadow-[0_3px_14px_rgba(0,0,0,0.65)] sm:text-7xl md:text-8xl"
            >
              आजी
            </span>{" "}
            <span className="ml-2 font-heading text-5xl font-semibold text-black/90 drop-shadow-[0_1px_10px_rgba(255,255,255,0.35)] sm:ml-3 sm:text-6xl md:text-7xl">
              Kitchen
            </span>
          </motion.h1>

          {/* Plain text, no boxes — a label with a small arrow beneath it. */}
          <motion.nav
            {...rise(0.18)}
            aria-label="Main"
            className="mt-6 flex flex-wrap items-start justify-center gap-x-7 gap-y-3 sm:mt-8 sm:gap-x-12"
          >
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex flex-col items-center gap-0.5 rounded-lg px-1 text-white/90 outline-none transition-colors hover:text-gold focus-visible:ring-3 focus-visible:ring-white/60"
              >
                <span className="text-base font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-lg">
                  {item.label}
                  {item.to === "/cart" && itemCount > 0 && (
                    <span className="ml-1.5 text-sm text-gold">({itemCount})</span>
                  )}
                </span>
                <ChevronDown
                  className="size-4 opacity-70 transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </motion.nav>

          {/* चटक मटक — in the gap between the two thalis, by her shoulder.
              Percentages follow the photo, which is anchored centre on wide
              screens. On a phone the crop is tighter, so it sits under the nav. */}
          <motion.div
            {...rise(0.42)}
            className={cn(
              "mt-10 text-center sm:mt-0",
              "sm:absolute sm:top-[52%] sm:left-[43%] sm:w-60 sm:-translate-x-1/2 sm:-translate-y-1/2 md:w-72",
            )}
          >
            <p
              lang="mr"
              className="font-display-mr text-4xl text-gold drop-shadow-[0_3px_16px_rgba(0,0,0,0.8)] sm:text-5xl"
            >
              चटक मटक
            </p>
            <p className="mt-1 text-sm text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Cooked to order, in one grandmother's kitchen.
            </p>
          </motion.div>
        </div>

        <motion.div {...rise(0.6)} className="flex justify-center pb-8">
          <a
            href="#about-aji"
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/80 outline-none transition-colors hover:text-gold focus-visible:ring-3 focus-visible:ring-white/60"
          >
            Her story
            <ChevronDown className="size-5 animate-bounce" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
