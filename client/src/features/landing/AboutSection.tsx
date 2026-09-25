import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * Section two, on parchment: Aaji herself first and for longer, then the food
 * she makes, inside the swirl frame. Ornaments unfurl into the four corners as
 * the section arrives.
 */
const SLIDES = [
  { src: "/aji/aaji.webp", ms: 6000 },
  { src: "/aji/thali-raised.webp", ms: 3600 },
  { src: "/dishes/puran-poli-thali.webp", ms: 3600 },
  { src: "/dishes/ukadiche-modak.webp", ms: 3600 },
  { src: "/aji/thali-lower.webp", ms: 3600 },
  { src: "/dishes/chakli.webp", ms: 3600 },
];

const CORNERS = [
  { key: "tl", className: "top-0 left-0" },
  { key: "tr", className: "top-0 right-0 -scale-x-100" },
  { key: "bl", className: "bottom-0 left-0 -scale-y-100" },
  { key: "br", className: "bottom-0 right-0 -scale-100" },
];

export function AboutSection() {
  const [index, setIndex] = useState(0);
  const [cornersIn, setCornersIn] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Each picture holds for its own time, so Aaji stays on screen longer.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDES[index]!.ms);
    return () => clearTimeout(id);
  }, [index]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCornersIn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-aji"
      className="relative scroll-mt-4 overflow-hidden py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#e8d5b0] bg-repeat"
        style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
      />

      {/* The four corner ornaments, unfurling as the section arrives. */}
      {CORNERS.map((corner, i) => (
        <img
          key={corner.key}
          src="/textures/corner-ornament.png"
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute w-28 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-40 lg:w-52",
            corner.className,
            cornersIn ? "scale-100 opacity-95" : "scale-50 opacity-0",
          )}
          style={{ transitionDelay: `${i * 140}ms` }}
        />
      ))}

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16 lg:px-16">
        <Reveal className="mx-auto w-full max-w-[22rem] md:max-w-[25rem]">
          <figure className="relative aspect-square w-full">
            <div className="absolute inset-[9%] overflow-hidden rounded-full shadow-[0_14px_40px_rgba(70,40,15,0.35)]">
              {SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-opacity duration-1000"
                  style={{ opacity: i === index ? 1 : 0 }}
                />
              ))}
            </div>

            <img
              src="/textures/circle-frame.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full select-none"
            />
          </figure>
        </Reveal>

        <div>
          <Reveal delay={0.08}>
            <p lang="mr" className="font-display-mr text-3xl text-[#9a3412] sm:text-4xl">
              आजीच्या हातची चव
            </p>
            <h2 className="mt-3 font-royal text-3xl font-bold tracking-wide text-[#4a2410] sm:text-4xl">
              Forty years at the same stove
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-[#5b3620]">
              <p>
                Aaji has cooked for her family since she was nineteen, first for her own house, then for every
                wedding, haldi and Ganpati on the street. Nothing here comes out of a packet. The bhajani is ground at
                home, the masala is pounded and not bought, the ghee is her own, and the vegetables are picked the
                morning she cooks them.
              </p>
              <p>
                She cooks one order at a time, which is why she reads and confirms each one herself. If she cannot do
                your day, she will say so.
              </p>
              <p className="font-script text-xl italic text-[#9a3412] sm:text-2xl">
                Food that tastes like someone's home, because it came from one.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="rounded-full bg-[#9a3412] px-7 py-3 font-royal text-sm font-bold tracking-wide text-[#f8ecd5] outline-none transition-colors hover:bg-[#7c2d12] focus-visible:ring-3 focus-visible:ring-[#9a3412]/40 sm:text-base"
              >
                See what she's making
              </Link>
              <Link
                to="/plan"
                className="rounded-full border border-[#9a3412]/50 px-7 py-3 font-royal text-sm font-bold tracking-wide text-[#7c2d12] outline-none transition-colors hover:bg-[#9a3412]/10 focus-visible:ring-3 focus-visible:ring-[#9a3412]/30 sm:text-base"
              >
                Plan an occasion
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
