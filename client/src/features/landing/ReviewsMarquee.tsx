import { Star } from "lucide-react";

interface Review {
  name: string;
  where: string;
  rating: number;
  text: string;
}

/**
 * Sample reviews — written to show what the section looks like, and labelled
 * as samples so nobody reads them as real customers. Replace them with real
 * ones the moment Aji has them.
 */
const REVIEWS: Review[] = [
  {
    name: "Meenal Deshpande",
    where: "Ganpati at home",
    rating: 5,
    text: "Twenty-one modak, delivered warm at eight in the morning. My mother-in-law asked for the recipe, which has never happened before.",
  },
  {
    name: "Rohit Kulkarni",
    where: "Office Diwali",
    rating: 5,
    text: "Ordered faral tins for the whole team. The chakli was still crisp four days later. Everyone asked where it came from.",
  },
  {
    name: "Sneha Patil",
    where: "Haldi, 60 guests",
    rating: 5,
    text: "She called to check how spicy we wanted the misal. Who does that any more? Food arrived exactly on time.",
  },
  {
    name: "Ajay Salunkhe",
    where: "Sunday lunch",
    rating: 4,
    text: "The surmai thali is the real thing — proper malvani masala, and the solkadhi was perfect. Only wish the portions of rice were bigger.",
  },
  {
    name: "Prachi Joshi",
    where: "Upvas order",
    rating: 5,
    text: "Sabudana khichdi that isn't sticky. I've given up ordering it anywhere else.",
  },
  {
    name: "Nikhil Rane",
    where: "Puran poli for Holi",
    rating: 5,
    text: "Thin, soft, and the puran was not too sweet. Tasted like my grandmother's, which is the highest thing I can say.",
  },
];

function Card({ review }: { review: Review }) {
  return (
    <figure className="w-[19rem] shrink-0 rounded-2xl border border-gold/25 bg-wood-deep/70 p-5 text-cream shadow-lg sm:w-[22rem]">
      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={i < review.rating ? "size-4 fill-gold text-gold" : "size-4 text-cream/30"}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote className="mt-3 text-cream/90">“{review.text}”</blockquote>
      <figcaption className="mt-4 text-sm">
        <span className="font-semibold text-gold">{review.name}</span>
        <span className="block text-cream/60">{review.where}</span>
      </figcaption>
    </figure>
  );
}

export function ReviewsMarquee() {
  return (
    <section className="overflow-hidden bg-wood-deep py-14 sm:py-20" aria-labelledby="reviews-heading">
      <div className="mx-auto mb-8 w-full max-w-6xl px-4">
        <h2 id="reviews-heading" className="font-heading text-4xl font-semibold text-cream">
          What people say
        </h2>
        <p className="mt-1 text-sm text-cream/55">
          Sample reviews — real ones will replace these as Aji's customers send them in.
        </p>
      </div>

      <div className="marquee relative">
        {/* The track holds the list twice, so the loop has no visible seam. */}
        <div className="marquee-track flex w-max gap-5 px-4">
          {[...REVIEWS, ...REVIEWS].map((review, i) => (
            <Card key={`${review.name}-${i}`} review={review} />
          ))}
        </div>

        {/* Fade the strip into the background at both ends. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-wood-deep to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-wood-deep to-transparent"
        />
      </div>
    </section>
  );
}
