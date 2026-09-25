import { useEffect } from "react";

/**
 * Smooth scrolling, landing page only — it suits a long marketing page and
 * would only get in the way of the menu, the cart or Aaji's dashboard.
 * Loaded on demand so it never lands in the first download, and skipped
 * entirely for anyone who prefers reduced motion.
 */
export function useSmoothScroll(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.05, wheelMultiplier: 0.9 });
      let frame = requestAnimationFrame(function raf(time: number) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      });
      cleanup = () => {
        cancelAnimationFrame(frame);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled]);
}
