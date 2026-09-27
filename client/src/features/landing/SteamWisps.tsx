import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useCoverBox } from "./coverMap";

/**
 * Steam curling off the food in the hero photograph.
 *
 * Each plume is a soft, irregular blob that rises while it twists, swells and
 * fades — so it reads as a curl of steam rather than a rising dot. Several
 * plumes per plate, on offset loops, give a continuous column.
 *
 * Positions are given in the photograph's own pixels and mapped by
 * `coverMap`, so a plume stays over its katori whichever way the picture gets
 * cropped. This must sit in the same box as the background it belongs to.
 */

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
  { x: 110, y: 300, size: 116, delay: 0, duration: 7.5, sway: 32, peak: 0.95, spin: -1 },
  { x: 150, y: 285, size: 97, delay: 1.2, duration: 8.2, sway: -27, peak: 0.81, spin: 1 },
  { x: 196, y: 272, size: 124, delay: 2.4, duration: 7.8, sway: 28, peak: 0.9, spin: -1 },
  { x: 245, y: 278, size: 103, delay: 3.6, duration: 8.6, sway: -30, peak: 0.84, spin: 1 },
  { x: 296, y: 292, size: 119, delay: 4.8, duration: 8, sway: 27, peak: 0.87, spin: -1 },
  { x: 140, y: 258, size: 151, delay: 6, duration: 9.2, sway: -23, peak: 0.64, spin: 1 },
  { x: 232, y: 246, size: 162, delay: 2.9, duration: 9.6, sway: 21, peak: 0.58, spin: -1 },
];

// The raised thali, up near her shoulder.
const RAISED_PLATE: Plume[] = [
  { x: 452, y: 205, size: 113, delay: 0.6, duration: 7.6, sway: 30, peak: 0.95, spin: 1 },
  { x: 500, y: 186, size: 94, delay: 1.8, duration: 8.4, sway: -27, peak: 0.81, spin: -1 },
  { x: 552, y: 176, size: 122, delay: 3, duration: 7.9, sway: 28, peak: 0.9, spin: 1 },
  { x: 606, y: 186, size: 103, delay: 4.2, duration: 8.8, sway: -30, peak: 0.84, spin: -1 },
  { x: 656, y: 204, size: 116, delay: 5.4, duration: 8.1, sway: 27, peak: 0.87, spin: 1 },
  { x: 524, y: 148, size: 148, delay: 2.2, duration: 9.4, sway: 19, peak: 0.64, spin: 1 },
  { x: 618, y: 142, size: 143, delay: 6.4, duration: 9.8, sway: -21, peak: 0.58, spin: -1 },
];

const PLUMES = [...LOWER_PLATE, ...RAISED_PLATE];

export function SteamWisps({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Its box is the picture's own box, so the pan never enters into it.
  const box = useCoverBox(containerRef, 0);

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
                height: size * 1.35,
                animationDelay: `${plume.delay}s`,
                animationDuration: `${plume.duration}s`,
                ["--sway" as string]: `${plume.sway * box.scale}px`,
                ["--peak" as string]: plume.peak,
                ["--spin" as string]: plume.spin,
                filter: `blur(${Math.max(9, 13 * box.scale)}px)`,
              }}
            />
          );
        })}
    </div>
  );
}
