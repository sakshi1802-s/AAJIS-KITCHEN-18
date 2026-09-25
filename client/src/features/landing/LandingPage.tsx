import { AboutBook } from "./AboutBook";
import { HeroSection } from "./HeroSection";
import { ReviewsSection } from "./ReviewsSection";
import { useSmoothScroll } from "./useSmoothScroll";

/**
 * Three sections on one page: the photograph, then Aaji's story as a book
 * that turns itself, then the wall of reviews. Smooth scrolling ties them
 * together and is only ever used here.
 */
export function LandingPage() {
  useSmoothScroll();

  return (
    <>
      <HeroSection />
      <AboutBook />
      <ReviewsSection />
    </>
  );
}
