import { useEffect, useState, type RefObject } from "react";

/**
 * Maps points in the home photograph to points on screen.
 *
 * The picture is a `background-size: cover` behind the whole home page, so
 * anything meant to sit on a particular part of it — the steam over her
 * katoris, चटक मटक in the gap between the thalis — has to go through the same
 * maths the browser uses, or it drifts as the window changes shape.
 */

/** The photograph's own pixels. Its file is twice this; only the ratio matters. */
export const IMAGE_W = 719;
export const IMAGE_H = 2000;

/** Where the pan starts, chosen so both thalis are in frame at the top. */
export const START_PAN = 0.05;

export interface CoverBox {
  /** The measured box the picture is covering. */
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  /** Screen position of a point given in the photograph's pixels. */
  at: (x: number, y: number) => { left: number; top: number };
}

/**
 * `panY` is the same 0–1 that `background-position` uses: 0 pins the top of
 * the picture, 1 the bottom.
 */
export function useCoverBox(ref: RefObject<HTMLElement | null>, panY: number): CoverBox | null {
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
      const offsetX = (width - IMAGE_W * scale) / 2;
      const offsetY = (height - IMAGE_H * scale) * panY;
      setBox({
        width,
        height,
        scale,
        offsetX,
        offsetY,
        at: (x, y) => ({ left: offsetX + x * scale, top: offsetY + y * scale }),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ref, panY]);

  return box;
}
