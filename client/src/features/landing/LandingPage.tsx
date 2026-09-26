import { AboutBook } from "./AboutBook";
import { HeroSection } from "./HeroSection";
import { ReviewsSection } from "./ReviewsSection";
import { SteamWisps } from "./SteamWisps";
import { useSmoothScroll } from "./useSmoothScroll";

/**
 * One photograph for the whole home page, pinned to the window and panned as
 * you scroll. The pan itself lives in `.bg-pan-layer` in index.css as a
 * scroll-driven animation, so nothing here runs while you scroll; the steam
 * sits inside the same layer and follows the picture for free.
 */
export function LandingPage() {
  useSmoothScroll();

  return (
    <div className="relative isolate w-full">
      <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden bg-wood-deep">
        <div className="bg-pan-layer absolute inset-x-0 top-0">
          <img
            src="/hero/home-bg.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-center select-none"
          />
          {/* Same box as the picture, so the plumes land on the thalis. */}
          <SteamWisps />
        </div>
        {/* Just enough to keep white text readable over the brightest part. */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <HeroSection />
      <AboutBook />
      <ReviewsSection />
    </div>
  );
}
