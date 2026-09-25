import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait once it enters view. */
  delay?: number;
  className?: string;
}

/**
 * Slides and fades its children in the first time they scroll into view.
 *
 * This is a plain IntersectionObserver and a CSS transition on purpose:
 * Motion's whileInView was firing before anything had scrolled (the sections
 * already intersect on a tall page), which is why the reveals weren't
 * showing. Here nothing animates until the element genuinely comes into view.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Anyone who asked for less motion sees it in place from the start.
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      // Any part of the block entering above the bottom eighth of the screen
      // is enough. A percentage threshold would strand a block taller than the
      // window, which never reaches it.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]",
        shown ? "translate-y-0 opacity-100" : "translate-y-14 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
