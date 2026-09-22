import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * Steam over the food in the hero photograph.
 *
 * Each wisp is a soft blurred ellipse that rises, drifts sideways, widens and
 * fades — the way steam actually behaves. They run on long, offset loops so
 * the pattern never looks like it's repeating. No particles and no glow: this
 * should read as a slightly hazy photo, not an effect.
 *
 * Positions are given in the PHOTOGRAPH's own pixels and mapped through the
 * same maths `object-fit: cover` uses, so a wisp stays over its katori
 * whichever way the image gets cropped.
 */

const IMAGE_W = 1536;
const IMAGE_H = 1024;

interface Wisp {
  /** centre of the wisp, in the photograph's pixels */
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
}

// The thali she carries low in her right hand.
const LOWER_PLATE: Wisp[] = [
  { x: 250, y: 560, w: 150, h: 240, delay: 0, duration: 11, drift: -26, opacity: 0.46 },
  { x: 390, y: 505, w: 130, h: 215, delay: 3.4, duration: 13, drift: 18, opacity: 0.38 },
  { x: 520, y: 545, w: 140, h: 225, delay: 6.8, duration: 12, drift: -12, opacity: 0.34 },
];

// The raised thali, up near her shoulder.
const RAISED_PLATE: Wisp[] = [
  { x: 1010, y: 300, w: 135, h: 220, delay: 1.6, duration: 12.5, drift: 22, opacity: 0.4 },
  { x: 1160, y: 250, w: 120, h: 200, delay: 5.2, duration: 11.5, drift: -18, opacity: 0.36 },
  { x: 1310, y: 290, w: 130, h: 210, delay: 8.6, duration: 13.5, drift: 14, opacity: 0.3 },
];

const WISPS = [...LOWER_PLATE, ...RAISED_PLATE];

interface CoverBox {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** Where `object-fit: cover` actually puts the photo inside its box. */
function useCoverBox(ref: RefObject<HTMLElement | null>): CoverBox | null {
  const [box, setBox] = useState<CoverBox | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const scale = Math.max(width / IMAGE_W, height / IMAGE_H);
      setBox({
        scale,
        offsetX: (width - IMAGE_W * scale) / 2,
        offsetY: (height - IMAGE_H * scale) / 2,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return box;
}

export function SteamWisps({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const box = useCoverBox(containerRef);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {box &&
        WISPS.map((wisp, i) => {
          const width = wisp.w * box.scale;
          const height = wisp.h * box.scale;
          return (
            <span
              key={i}
              className="steam-wisp"
              style={{
                left: box.offsetX + wisp.x * box.scale - width / 2,
                top: box.offsetY + wisp.y * box.scale - height / 2,
                width,
                height,
                animationDelay: `${wisp.delay}s`,
                animationDuration: `${wisp.duration}s`,
                ["--steam-drift" as string]: `${wisp.drift}px`,
                ["--steam-opacity" as string]: wisp.opacity,
              }}
            />
          );
        })}
    </div>
  );
}
