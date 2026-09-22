import { AboutSection } from "./AboutSection";
import { HeroSection } from "./HeroSection";
import { ReviewsMarquee } from "./ReviewsMarquee";
import { useSmoothScroll } from "./useSmoothScroll";

/**
 * Three sections on one page: the photograph, then Aji's story, then the
 * reviews strip. Smooth scrolling ties them together and is only ever used
 * here.
 */
export function LandingPage() {
  useSmoothScroll();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ReviewsMarquee />
    </>
  );
}
