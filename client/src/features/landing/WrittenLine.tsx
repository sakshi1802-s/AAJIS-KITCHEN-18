import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface WrittenLineProps {
  text: string;
  /** ms before the writing starts */
  delay?: number;
  /** ms the whole line takes to appear */
  duration?: number;
  className?: string;
}

/**
 * Reveals a line as though it were being written: the words are uncovered
 * left to right behind a soft edge, rather than appearing letter by letter.
 *
 * The text is always in the DOM at full width, so nothing around it moves
 * while it draws — the typewriter version pushed चटक मटक about as it grew.
 */
export function WrittenLine({ text, delay = 700, duration = 2200, className }: WrittenLineProps) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      // Ease out, the way a hand slows at the end of a line.
      setProgress(1 - Math.pow(1 - t, 2.2));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [delay, duration]);

  const pct = progress * 100;

  return (
    <span
      className={cn("inline-block", className)}
      style={{
        // A soft leading edge, so it looks like ink arriving rather than a
        // hard wipe. Same mask on both properties for Safari.
        WebkitMaskImage: `linear-gradient(to right, #000 ${pct}%, rgba(0,0,0,0.35) ${pct + 3}%, transparent ${pct + 7}%)`,
        maskImage: `linear-gradient(to right, #000 ${pct}%, rgba(0,0,0,0.35) ${pct + 3}%, transparent ${pct + 7}%)`,
      }}
    >
      {text}
    </span>
  );
}
