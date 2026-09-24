import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

/**
 * Section two: a small framed slideshow that rises into place as you scroll,
 * her story beside it, on the gavti wood.
 *
 * The pictures are close-ups cut from the hero photograph at near-native
 * resolution (server/scripts/dev/cropHero.py) — the collage tiles were too
 * small to fill a frame this size without going soft. When Aji's own photos
 * arrive, drop them into client/public/aji/ and list them here.
 */
const SLIDES = [
  { src: "/aji/thali-lower.webp", caption: "Sabudana khichdi, vada pav, thecha — an everyday plate" },
  { src: "/aji/thali-raised.webp", caption: "A full thali: bhaji, varan bhaat, puri, koshimbir, shrikhand" },
  { src: "/aji/carrying.webp", caption: "Carried to the table the way it's been done for forty years" },
];

const SLIDE_MS = 4500;

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Guard against a stale index (hot reload, or a shorter list next time).
  const current = SLIDES[index] ?? SLIDES[0]!;

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 48 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-90px" },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="about-aji" className="relative scroll-mt-4 overflow-hidden py-16 sm:py-24">
      {/* Gavti wood. Tiled at its own height so the grain stays sharp. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-wood-deep bg-repeat"
        style={{ backgroundImage: "url('/textures/wood-planks.jpg')", backgroundSize: "auto 100%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-12">
        {/* The frame — deliberately smaller than the text column. */}
        <motion.figure {...reveal()} className="mx-auto w-full max-w-[19rem]">
          <div className="rounded-lg border border-gold/60 bg-[#f6ecd9] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.6)] ring-1 ring-black/30">
            {/* The floral strip frames the picture, top and bottom. */}
            <img
              src="/textures/floral-border.png"
              alt=""
              aria-hidden="true"
              className="h-4 w-full scale-y-[-1] object-cover"
            />
            <div className="relative my-1.5 aspect-[4/3] w-full overflow-hidden">
              {SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.caption}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-opacity duration-[1200ms]"
                  style={{ opacity: i === index ? 1 : 0 }}
                />
              ))}
            </div>

            <img
              src="/textures/floral-border.png"
              alt=""
              aria-hidden="true"
              className="h-4 w-full object-cover"
            />

            <figcaption className="px-1 pt-2 pb-0.5 text-center font-royal text-[0.7rem] leading-snug tracking-wide text-[#6b3a1e]">
              {current.caption}
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
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-gold" : "w-3 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </motion.figure>

        <div>
          <motion.p {...reveal(0.05)} lang="mr" className="font-display-mr text-3xl text-gold sm:text-4xl">
            आजीच्या हातची चव
          </motion.p>

          <motion.h2
            {...reveal(0.1)}
            className="mt-3 font-royal text-3xl font-bold tracking-wide text-white sm:text-4xl"
          >
            Forty years at the same stove
          </motion.h2>

          <motion.div {...reveal(0.18)} className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-cream/90">
            <p>
              Aji has cooked for her family since she was nineteen — first for her own house, then for every wedding,
              haldi and Ganpati on the street. Nothing here comes out of a packet. The bhajani is ground at home, the
              masala is pounded and not bought, the ghee is her own, and the vegetables are picked the morning she
              cooks them.
            </p>
            <p>
              She cooks one order at a time, which is why she reads and confirms each one herself. If she cannot do
              your day, she will say so — she would rather turn an order down than send out food she isn't proud of.
            </p>
            <p className="font-royal text-lg tracking-wide text-gold sm:text-xl">
              Food that tastes like someone's home, because it came from one.
            </p>
          </motion.div>

          <motion.div {...reveal(0.26)} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="rounded-full bg-gold px-7 py-3 font-royal text-sm font-bold tracking-wide text-black outline-none transition-colors hover:bg-saffron focus-visible:ring-3 focus-visible:ring-gold/60 sm:text-base"
            >
              See what she's making
            </Link>
            <Link
              to="/plan"
              className="rounded-full border border-cream/50 px-7 py-3 font-royal text-sm font-bold tracking-wide text-cream outline-none transition-colors hover:border-gold hover:text-gold focus-visible:ring-3 focus-visible:ring-cream/40 sm:text-base"
            >
              Plan an occasion
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
