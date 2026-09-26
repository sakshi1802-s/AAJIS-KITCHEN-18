import { useEffect, useRef } from "react";
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
 * near edge of the table under the reviews.
 *
 * The pan is a `transform` written straight to the node, not React state and
 * not `background-position`. Both of those repaint a full-screen picture on
 * every frame, which is what made the scroll judder; a transform is handed to
 * the compositor and costs nothing. The steam rides inside the same layer, so
 * it follows the photograph for free.
 */
export function LandingPage() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const layer = layerRef.current;
    if (!page || !layer) return;

    let frame = 0;
    let last = -1;

    const paint = () => {
      frame = 0;
      const rect = page.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      const pan = START_PAN + progress * (1 - START_PAN);

      const spare = layer.offsetHeight - window.innerHeight;
      // translate3d rather than a top/background-position change: the browser
      // hands it to the compositor instead of repainting the picture.
      const y = Math.round(-spare * pan);
      if (y === last) return;
      last = y;
      layer.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(paint);
    };

    paint();
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
      <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden bg-wood-deep">
        <div
          ref={layerRef}
          className="absolute inset-x-0 top-0"
          // Its own ratio (719 × 2000), so nothing is squashed; never shorter
          // than the window, so it always covers.
          style={{ height: "max(calc(100vw * 2.782), 100svh)" }}
        >
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
