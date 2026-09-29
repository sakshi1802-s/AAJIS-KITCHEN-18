import { ChevronRight, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { isKitchenPath } from "@/features/auth/authContext";
import { formatINR } from "@/lib/format";
import { useCart } from "./cartContext";

/**
 * The plate, as a pill that floats at the bottom of the screen.
 *
 * It replaces the toast that used to fire on every tap. A toast interrupts,
 * stacks up and then disappears, which is no use when you are adding six
 * dishes; this stays put, counts up as you go, and is the way to checkout.
 * It flashes "Added" for a moment on each tap so a tap still feels answered.
 */
export function PlateBar() {
  const { itemCount, total } = useCart();
  const { pathname } = useLocation();

  const [justAdded, setJustAdded] = useState(false);
  const lastCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > lastCount.current) {
      setJustAdded(true);
      const id = setTimeout(() => setJustAdded(false), 1400);
      lastCount.current = itemCount;
      return () => clearTimeout(id);
    }
    lastCount.current = itemCount;
  }, [itemCount]);

  // Nothing to carry, or nowhere worth carrying it: the plate page and
  // checkout already show all of this, and the kitchen has no plate.
  const hidden =
    itemCount === 0 || isKitchenPath(pathname) || pathname === "/cart" || pathname === "/checkout";

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <Link
        to="/cart"
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-gold/40 bg-[#7c2d12] py-3 pr-4 pl-5 text-[#f8ecd5] shadow-[0_14px_40px_rgba(0,0,0,0.6)] outline-none transition-colors hover:bg-[#9a3412] focus-visible:ring-3 focus-visible:ring-gold/50 sm:py-3.5 sm:pr-5 sm:pl-6"
      >
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f8ecd5]/15">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold font-royal text-[11px] font-bold text-[#4a2410] tabular-nums">
            {itemCount}
          </span>
        </span>

        <span className="min-w-0 text-left leading-tight">
          <span className="block font-royal text-sm font-bold tracking-wide">
            {justAdded ? "Added to your plate" : `${itemCount} on your plate`}
          </span>
          <span className="block text-xs text-[#f8ecd5]/75 tabular-nums">{formatINR(total)}</span>
        </span>

        <ChevronRight className="size-5 shrink-0 text-[#f8ecd5]/80" aria-hidden="true" />
      </Link>
    </div>
  );
}
