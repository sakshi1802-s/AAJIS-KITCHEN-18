import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { useCart } from "@/features/cart/cartContext";
import { AccountMenu } from "./AccountMenu";

/** Menu sits second and the planner third, as asked. */
const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/plan", label: "Planner AI" },
  { to: "/cart", label: "Cart" },
];

/**
 * The wordmark and navigation — identical on every page of the site. It sits
 * over the photograph on the landing page and over the wood everywhere else,
 * so it carries no background of its own.
 */
export function RoyalHeader() {
  const reduceMotion = useReducedMotion();
  const { itemCount } = useCart();

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40">
      <div className="relative flex items-center justify-center px-4 pt-4 sm:px-8 sm:pt-5">
        <motion.p {...rise(0.05)} className="pointer-events-auto text-center leading-none">
          <Link to="/" className="rounded outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
            <span
              lang="mr"
              className="font-display-mr text-[1.85rem] text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.85)] sm:text-[2.2rem] md:text-[2.6rem]"
            >
              आजी
            </span>
            <span className="font-royal text-base font-bold text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.85)] sm:text-lg md:text-xl">
              ’S
            </span>{" "}
            <span className="font-royal text-2xl font-bold tracking-wide text-black [text-shadow:0_0_16px_rgba(255,255,255,0.9),0_0_34px_rgba(255,238,205,0.6)] sm:text-[1.75rem] md:text-[2.1rem]">
              Kitchen
            </span>
          </Link>
        </motion.p>

        <div className="pointer-events-auto absolute top-1/2 right-4 -translate-y-1/2 sm:right-8">
          <AccountMenu onHero />
        </div>
      </div>

      {/* Plain labels, no box, spread right across. */}
      <motion.nav {...rise(0.16)} aria-label="Main" className="mt-2.5 w-full px-6 sm:mt-3.5 sm:px-16 lg:px-28">
        <ul className="pointer-events-auto flex items-center justify-between gap-2">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded-md px-1 py-1 font-royal text-sm font-semibold tracking-[0.12em] text-white uppercase outline-none transition-colors [text-shadow:0_2px_12px_rgba(0,0,0,0.95)] hover:text-gold focus-visible:ring-2 focus-visible:ring-white/70 sm:text-base"
              >
                {item.label}
                {item.to === "/cart" && itemCount > 0 && <span className="ml-1 text-gold">({itemCount})</span>}
              </Link>
            </li>
          ))}
        </ul>
      </motion.nav>
    </header>
  );
}
