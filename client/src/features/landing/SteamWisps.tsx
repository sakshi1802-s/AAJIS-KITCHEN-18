import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * Steam curling off the food in the hero photograph.
 *
 * Each plume is a soft, irregular blob that rises while it twists, swells and
 * fades — so it reads as a curl of steam rather than a rising dot. Several
 * plumes per plate, on offset loops, give a continuous column.
 *
 * Positions are given in the PHOTOGRAPH's own pixels and mapped through the
 * same maths `object-fit: cover` uses, so a plume stays over its katori
 * whichever way the image gets cropped.
 */

const IMAGE_W = 1536;
const IMAGE_H = 1024;

interface Plume {
  /** where it starts, in the photograph's pixels */
  x: number;
  y: number;
  /** size in photograph pixels */
  size: number;
  delay: number;
  duration: number;
  /** how far it wanders sideways as it climbs */
  sway: number;
  /** brightest it ever gets */
  peak: number;
  /** which way it curls */
  spin: 1 | -1;
}

// The thali she carries low, in her right hand.
const LOWER_PLATE: Plume[] = [
  { x: 250, y: 585, size: 210, delay: 0, duration: 8, sway: 46, peak: 0.62, spin: -1 },
  { x: 330, y: 560, size: 170, delay: 2.1, duration: 9.5, sway: -38, peak: 0.5, spin: 1 },
  { x: 430, y: 545, size: 230, delay: 4.2, duration: 8.8, sway: 40, peak: 0.58, spin: -1 },
  { x: 540, y: 575, size: 180, delay: 6.1, duration: 10, sway: -44, peak: 0.46, spin: 1 },
  { x: 350, y: 520, size: 260, delay: 3.2, duration: 11, sway: 30, peak: 0.4, spin: -1 },
];

// The raised thali, up near her shoulder.
const RAISED_PLATE: Plume[] = [
  { x: 1020, y: 320, size: 200, delay: 1.1, duration: 8.6, sway: 42, peak: 0.7, spin: 1 },
  { x: 1140, y: 285, size: 165, delay: 3.4, duration: 9.8, sway: -36, peak: 0.6, spin: -1 },
  { x: 1265, y: 300, size: 220, delay: 5.5, duration: 9, sway: 38, peak: 0.66, spin: 1 },
  { x: 1380, y: 330, size: 175, delay: 7.4, duration: 10.4, sway: -40, peak: 0.56, spin: -1 },
  { x: 1300, y: 210, size: 190, delay: 4.6, duration: 10.8, sway: 34, peak: 0.5, spin: 1 },
  { x: 1150, y: 250, size: 250, delay: 2.4, duration: 11.5, sway: 26, peak: 0.38, spin: 1 },
];

const PLUMES = [...LOWER_PLATE, ...RAISED_PLATE];

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

    let frame = 0;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) {
        // Mounted in a hidden tab or a collapsed pane: keep looking until the
        // box has a size, rather than rendering nothing for ever.
        frame = requestAnimationFrame(measure);
        return;
      }
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
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
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
        PLUMES.map((plume, i) => {
          const size = plume.size * box.scale;
          return (
            <span
              key={i}
              className="steam-plume"
              style={{
                left: box.offsetX + plume.x * box.scale - size / 2,
                top: box.offsetY + plume.y * box.scale - size / 2,
                width: size,
                height: size * 1.25,
                animationDelay: `${plume.delay}s`,
                animationDuration: `${plume.duration}s`,
                ["--sway" as string]: `${plume.sway * box.scale}px`,
                ["--peak" as string]: plume.peak,
                ["--spin" as string]: plume.spin,
                filter: `blur(${Math.max(10, 16 * box.scale)}px)`,
              }}
            />
          );
        })}
    </div>
  );
}
