import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";

const SLOGANS = [
  "घरगुती चव, प्रेमाने — home taste, made with love",
  "Ground at home. Pounded at home. Cooked to order.",
  "Every order read and confirmed by Aji herself",
  "Forty years at the same stove",
  "चटक मटक! — the taste you remember",
  "No packets, no shortcuts, no hurry",
];

const SHOW_MS = 650;

/** A brass thali that turns, with steam lifting off it. */
function ThaliSpinner() {
  return (
    <svg viewBox="0 0 120 120" className="size-20" role="img" aria-label="Loading">
      <g className="origin-center animate-[spin_2.6s_linear_infinite]">
        <circle cx="60" cy="70" r="34" fill="none" stroke="rgba(255,214,140,0.3)" strokeWidth="3" />
        <circle
          cx="60"
          cy="70"
          r="34"
          fill="none"
          stroke="#f2c15c"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="34 180"
        />
        <circle
          cx="60"
          cy="70"
          r="22"
          fill="none"
          stroke="rgba(255,214,140,0.45)"
          strokeWidth="2"
          strokeDasharray="3 7"
        />
      </g>
      <circle cx="60" cy="70" r="11" fill="#f2c15c" opacity="0.85" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${48 + i * 12} 44 q6 -9 0 -18`}
          fill="none"
          stroke="rgba(255,240,214,0.75)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDelay: `${i * 0.45}s` }}
        />
      ))}
    </svg>
  );
}

/**
 * A short curtain between pages: Aji's mark, a turning thali and one line
 * about her food. Deliberately brief — a beat, not a wait.
 *
 * It is rendered only while it is showing and never takes pointer events, so
 * a stuck curtain can't swallow clicks the way an exit animation left behind
 * once did.
 */
export function PageLoader() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [slogan, setSlogan] = useState(SLOGANS[0]!);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSlogan(SLOGANS[Math.floor(Math.random() * SLOGANS.length)]!);
    setVisible(true);
    const id = setTimeout(() => setVisible(false), SHOW_MS);
    return () => {
      clearTimeout(id);
      setVisible(false);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#5b2f12]",
        "animate-in fade-in duration-200",
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-center leading-none">
        <span lang="mr" className="font-display-mr text-4xl text-gold">
          आजी
        </span>
        <span className="font-royal text-lg font-bold text-gold">’S</span>{" "}
        <span className="font-royal text-2xl font-bold tracking-wide text-[#2b1508]">Kitchen</span>
      </p>
      <ThaliSpinner />
      <p className="max-w-xs px-6 text-center font-royal text-xs tracking-wide text-[#f6e3c4]/85 sm:text-sm">
        {slogan}
      </p>
    </div>
  );
}
