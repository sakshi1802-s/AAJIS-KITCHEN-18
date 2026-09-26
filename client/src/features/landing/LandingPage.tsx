import { useEffect, useRef, useState } from "react";
import { AboutBook } from "./AboutBook";
import { HeroSection } from "./HeroSection";
import { ReviewsSection } from "./ReviewsSection";
import { START_PAN } from "./coverMap";
import { SteamWisps } from "./SteamWisps";
import { useSmoothScroll } from "./useSmoothScroll";

/**
 * One photograph for the whole home page. Rather than stretching it down a
 * very long page, it is pinned to the window and panned as you scroll: her
 * thalis at the top, the empty middle of the table where the book rests, the
 * near edge of the table under the reviews. That keeps the page a normal
 * length and the picture at its own size, so it stays sharp.
 */

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function LandingPage() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState(START_PAN);

  useEffect(() => {
    const element = pageRef.current;
    if (!element) return;

    let frame = 0;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? clamp(-rect.top / travel) : 0;
      setPan(START_PAN + progress * (1 - START_PAN));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={pageRef} className="relative isolate w-full">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-20 bg-wood-deep bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/hero/home-bg.webp')", backgroundPosition: `center ${pan * 100}%` }}
      />
      {/* Just enough to keep white text readable over the brightest part. */}
      <div aria-hidden="true" className="fixed inset-0 -z-20 bg-black/20" />

      {/* Pinned and panned with the photograph, so the plumes stay on the thalis. */}
      <SteamWisps className="fixed -z-10" panY={pan} />

      <HeroSection />
      <AboutBook />
      <ReviewsSection />
    </div>
  );
}
