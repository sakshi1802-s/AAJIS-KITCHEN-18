import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

/**
 * Section two: a large round portrait in the scalloped frame that rises into
 * place as the section scrolls in, with her story beside it on the wood.
 *
 * Six pictures cycle through — close-ups from the hero photograph and dishes
 * she makes. Aji's own photographs drop straight into this list when they
 * arrive (client/public/aji/).
 */
const SLIDES = [
  { src: "/aji/thali-raised.webp", caption: "A full thali — bhaji, varan bhaat, puri, koshimbir, shrikhand" },
  { src: "/dishes/puran-poli-thali.webp", caption: "Puran poli, rolled thin enough to see through" },
  { src: "/aji/thali-lower.webp", caption: "Sabudana khichdi, vada pav, thecha — an everyday plate" },
  { src: "/dishes/ukadiche-modak.webp", caption: "Twenty-one modak, steamed every Ganpati morning" },
  { src: "/dishes/chakli.webp", caption: "Faral fried in small batches, one tin at a time" },
  { src: "/aji/carrying.webp", caption: "Carried to the table the way it's been done for forty years" },
];

const SLIDE_MS = 3800;

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = SLIDES[index] ?? SLIDES[0]!;

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // A clear, unhurried reveal as the section comes into view.
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 70 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section id="about-aji" className="relative scroll-mt-4 py-20 sm:py-28">
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 md:grid-cols-2">
        <motion.figure {...reveal()} className="relative mx-auto aspect-square w-full max-w-[26rem] md:max-w-[30rem]">
          {/* The photograph, clipped to a circle inside the scalloped ring. */}
          <div className="absolute inset-[13%] overflow-hidden rounded-full shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
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
          </div>

          <img
            src="/textures/round-frame.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full select-none"
          />

          <figcaption className="absolute inset-x-0 -bottom-8 text-center font-royal text-xs tracking-wide text-cream/80 sm:text-sm">
            {current.caption}
          </figcaption>
        </motion.figure>

        <div className="mt-10 md:mt-0">
          <motion.p {...reveal(0.05)} lang="mr" className="font-display-mr text-3xl text-gold sm:text-4xl">
            आजीच्या हातची चव
          </motion.p>

          <motion.h2 {...reveal(0.12)} className="mt-3 font-royal text-3xl font-bold tracking-wide text-white sm:text-4xl">
            Forty years at the same stove
          </motion.h2>

          <motion.div {...reveal(0.2)} className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-cream/90">
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

          <motion.div {...reveal(0.28)} className="mt-8 flex flex-wrap gap-3">
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
