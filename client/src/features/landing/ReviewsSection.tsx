import type { ReviewDTO } from "@shared/api";
import { Reveal } from "@/components/Reveal";
import { LeaveReviewDialog } from "@/features/reviews/LeaveReviewDialog";
import { Stars } from "@/features/reviews/Stars";
import { usePublishedReviews } from "@/features/reviews/useReviews";
import { cn } from "@/lib/utils";

/**
 * Shown only until Aaji has published real ones, and labelled as samples so
 * nobody mistakes them for customers.
 */
const SAMPLES: ReviewDTO[] = [
  {
    id: "s1",
    name: "Meenal Deshpande",
    occasion: "Ganpati at home",
    rating: 5,
    text: "Twenty-one modak, delivered warm at eight in the morning exactly as promised. The ukad was soft and the saaran was not over-sweet.",
    isPublished: true,
    createdAt: "2026-09-04T03:30:00.000Z",
  },
  {
    id: "s2",
    name: "Rohit Kulkarni",
    occasion: "Office Diwali",
    rating: 5,
    text: "Chakli, shankarpali and besan ladoo for twenty people. Still crisp four days later, which tells you the oil was clean.",
    isPublished: true,
    createdAt: "2025-11-02T05:00:00.000Z",
  },
  {
    id: "s3",
    name: "Sneha Patil",
    occasion: "Haldi, 60 guests",
    rating: 5,
    text: "She called the evening before to ask how spicy we wanted the misal. Food reached at 11 sharp and nothing ran out.",
    isPublished: true,
    createdAt: "2026-08-17T06:00:00.000Z",
  },
  {
    id: "s4",
    name: "Ajay Salunkhe",
    occasion: "Sunday lunch",
    rating: 4,
    text: "Proper malvani masala, the surmai fried right, and the best solkadhi I have had outside Malvan.",
    isPublished: true,
    createdAt: "2026-07-12T07:00:00.000Z",
  },
  {
    id: "s5",
    name: "Prachi Joshi",
    occasion: "Upvas",
    rating: 5,
    text: "Sabudana khichdi that is not sticky and not oily, each sago separate, with enough peanut. I order nowhere else on fasting days.",
    isPublished: true,
    createdAt: "2026-09-09T04:00:00.000Z",
  },
  {
    id: "s6",
    name: "Nikhil Rane",
    occasion: "Holi",
    rating: 5,
    text: "Thin, soft puran poli, even right to the edge, and she sent katachi aamti with it without being asked.",
    isPublished: true,
    createdAt: "2026-03-05T05:30:00.000Z",
  },
];

const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/** A square torn out of a notebook, pinned to the wall at a slight angle. */
function Cutout({ review, index }: { review: ReviewDTO; index: number }) {
  // Fixed per position, so the wall looks hand-pinned and not random on
  // every render.
  const tilt = [-2.6, 1.8, -1.2, 2.4, -2, 1.4][index % 6];

  return (
    <figure
      className="paper-cutout relative size-48 shrink-0 bg-[#f6e7c8] p-4 shadow-[0_14px_28px_rgba(80,45,15,0.28)] sm:size-56"
      style={{ ["--tilt" as string]: `${tilt}deg`, animationDelay: `${(index % 6) * 0.9}s` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.45),transparent_60%)]"
      />
      <Stars rating={review.rating} />
      <blockquote className="mt-2 line-clamp-4 text-[0.85rem] leading-snug text-[#5b3620]">
        {review.text}
      </blockquote>
      <figcaption className="absolute right-4 bottom-3 left-4 border-t border-[#9a3412]/25 pt-2">
        <span className="block truncate font-royal text-sm font-bold text-[#7c2d12]">{review.name}</span>
        <span className="block truncate text-xs text-[#5b3620]/70">
          {review.occasion ? `${review.occasion} · ` : ""}
          {formatMonth(review.createdAt)}
        </span>
      </figcaption>
    </figure>
  );
}

/** Below this a drifting row would be mostly gaps, so it stands still instead. */
const ENOUGH_TO_DRIFT = 5;

function Row({ reviews, reverse }: { reviews: ReviewDTO[]; reverse?: boolean }) {
  if (reviews.length === 0) return null;

  // A handful of reviews sit still and centred. Repeating the same card across
  // the screen to fill a moving row makes one review look like six.
  if (reviews.length < ENOUGH_TO_DRIFT) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-2.5">
        {reviews.map((review, i) => (
          <Cutout key={review.id} review={review} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="marquee relative py-2.5">
      {/* Two copies of the row make the loop seamless. */}
      <div className={cn("marquee-track flex w-max items-center gap-6", reverse && "marquee-track--reverse")}>
        {[...reviews, ...reviews].map((review, i) => (
          <Cutout key={`${review.id}-${i}`} review={review} index={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Section three: Aaji's published reviews drifting past as paper cutouts,
 * scattered straight onto the near edge of the table in the photograph.
 * Customers add to it from here.
 */
export function ReviewsSection() {
  const published = usePublishedReviews();
  const reviews = published.data?.length ? published.data : SAMPLES;
  const isSample = !published.data?.length;

  // Two rows only once there are enough to fill both; until then, one.
  const split = reviews.length >= 2 * ENOUGH_TO_DRIFT;
  const half = Math.ceil(reviews.length / 2);
  const topRow = split ? reviews.slice(0, half) : reviews;
  const bottomRow = split ? reviews.slice(half) : [];

  return (
    <section
      className="relative flex min-h-[66svh] flex-col justify-center overflow-hidden py-8"
      aria-labelledby="reviews-heading"
    >
      <Reveal className="relative">
        <div className="mx-auto mb-6 w-full max-w-5xl px-4 text-center">
          <p lang="mr" className="font-display-mr text-2xl text-gold [text-shadow:0_3px_16px_rgba(0,0,0,0.85)] sm:text-3xl">
            लोक काय म्हणतात
          </p>
          <h2
            id="reviews-heading"
            className="mt-1 font-royal text-3xl font-bold tracking-wide text-cream [text-shadow:0_2px_14px_rgba(0,0,0,0.9)] sm:text-4xl"
          >
            What people say
          </h2>
        </div>

        <Row reviews={topRow} />
        <Row reviews={bottomRow} reverse />

        <div className="mt-8 flex flex-col items-center gap-3 px-4">
          <LeaveReviewDialog />
          <p className="text-xs text-cream/75 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
            {isSample
              ? "Sample reviews, shown until Aaji publishes her own."
              : "Aaji chooses which reviews appear here."}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
