import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/**
 * Aji's own photographs aren't in yet, so the frame cycles through her food
 * until they are. Drop files into client/public/aji/ and list them here — the
 * layout doesn't change.
 */
const SLIDES = [
  { src: "/dishes/puran-poli-thali.webp", caption: "Puran poli, rolled thin enough to see through" },
  { src: "/dishes/ukadiche-modak.webp", caption: "Twenty-one modak, steamed every Ganpati morning" },
  { src: "/dishes/thalipeeth.webp", caption: "Bhajani ground at home, not bought in a packet" },
  { src: "/dishes/veg-thali.webp", caption: "A full thali — the way lunch is meant to arrive" },
];

const SLIDE_MS = 4200;

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="about-aji" className="relative scroll-mt-4 overflow-hidden bg-wood py-16 sm:py-24">
      {/* Woody grain: warm bands rather than a photograph. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,240,210,0.5) 0 2px, rgba(0,0,0,0) 2px 26px), repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 1px, rgba(0,0,0,0) 1px 90px)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-14">
        <motion.figure {...reveal()} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border-4 border-gold/60 bg-wood-deep shadow-2xl">
            {SLIDES.map((slide, i) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={slide.caption}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-opacity duration-1000"
                style={{ opacity: i === index ? 1 : 0 }}
              />
            ))}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm text-white/90" aria-live="off">
              {SLIDES[index]!.caption}
            </figcaption>
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show ${slide.caption}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-gold" : "w-3 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </motion.figure>

        <div className="text-cream">
          <motion.p {...reveal(0.05)} lang="mr" className="font-display-mr text-3xl text-gold sm:text-4xl">
            आजीच्या हातची चव
          </motion.p>

          <motion.h2 {...reveal(0.1)} className="mt-3 font-heading text-4xl font-semibold text-cream sm:text-5xl">
            Forty years at the same stove.
          </motion.h2>

          <motion.div {...reveal(0.18)} className="mt-5 space-y-4 text-lg text-cream/85">
            <p>
              Aji has been cooking for her family since she was nineteen — first for her own house, then for every
              wedding, haldi and Ganpati in the building. Nothing here comes out of a packet. The bhajani is ground at
              home, the masala is pounded and not bought, the ghee is her own, and the vegetables are picked the same
              morning she cooks them.
            </p>
            <p>
              She cooks one order at a time, which is why she confirms each one herself. If she can't do your day, she
              will say so — she would rather turn an order down than send out food she isn't proud of.
            </p>
            <p className="font-heading text-xl text-gold">
              Food that tastes like someone's home, because it came from one.
            </p>
          </motion.div>

          <motion.div {...reveal(0.26)} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
              <Link to="/menu">See what she's making</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-cream/40 bg-transparent px-6 text-base text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Link to="/plan">Plan an occasion</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
