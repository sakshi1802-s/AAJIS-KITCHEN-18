import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { START_PAN, useCoverBox } from "./coverMap";
import { WrittenLine } from "./WrittenLine";

const TAGLINE = "Bringing Aaji's authentic gaavran जेवण, cooked the way she always has, straight to your ताट...";

/**
 * Where चटक sits, in the photograph's own pixels: the gap between the thali
 * she carries low and the one up by her shoulder. Anchoring it to the picture
 * rather than to the window keeps it in that gap on any screen shape.
 */
const ANCHOR = { x: 292, y: 232 };

/**
 * Section one: चटक मटक! in the gap between the two thalis, with one written
 * line beneath it. The photograph is the single background behind the whole
 * page, so this section only carries the words; the wordmark and navigation
 * come from the shared header.
 */
/** How wide the block gets, in px and as a share of the window; the class
 *  below must say the same, because the clamp reads these. */
const BLOCK_W = 416;
const BLOCK_VW = 0.58;

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // The first screen is exactly one window tall and sits at the very top of
  // the page, so the background's box and this section's box are the same.
  const box = useCoverBox(sectionRef, START_PAN);

  let placement: { left: number; top: number } | undefined;
  if (box) {
    const block = Math.min(BLOCK_W, box.width * BLOCK_VW);
    const spot = box.at(ANCHOR.x, ANCHOR.y);
    // Anchored to the picture, but never pushed off the side of a narrow one.
    placement = { left: Math.max(16, Math.min(spot.left, box.width - block - 16)), top: spot.top };
  }

  return (
    <section ref={sectionRef} className="relative min-h-svh w-full overflow-hidden">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-[min(26rem,58vw)]"
        style={
          placement ?? {
            // Until it has measured, keep it hidden rather than in the wrong
            // place for a frame.
            opacity: 0,
          }
        }
      >
        {/* The same kind of light that sits behind "Kitchen" in the wordmark:
            a close warm halo, not a lamp. */}
        <p
          lang="mr"
          className="flex flex-col leading-[0.88] text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(255,224,168,0.55),0_0_26px_rgba(255,196,110,0.3)]"
        >
          <span className="font-display-mr text-6xl sm:text-7xl md:text-8xl">चटक</span>
          <span className="mt-1.5 ml-14 font-display-mr text-4xl sm:ml-20 sm:text-5xl md:text-6xl">मटक!</span>
        </p>

        {/* Fixed height: the line draws itself without nudging anything. */}
        <p className="mt-4 min-h-[5rem] font-script text-lg italic text-cream [text-shadow:0_2px_14px_rgba(0,0,0,0.95)] sm:text-xl">
          <WrittenLine text={TAGLINE} duration={4200} />
        </p>
      </motion.div>
    </section>
  );
}
