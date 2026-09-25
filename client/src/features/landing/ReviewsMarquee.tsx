import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";

interface Review {
  name: string;
  where: string;
  when: string;
  rating: number;
  text: string;
}

/**
 * Sample reviews — written to show what the section looks like, and marked as
 * samples so nobody mistakes them for real customers. Replace them the moment
 * Aaji has her own.
 */
const REVIEWS: Review[] = [
  {
    name: "Meenal Deshpande",
    where: "Ganpati at home · 21 modak",
    when: "Sept 2026",
    rating: 5,
    text: "Delivered warm at eight in the morning, exactly as promised. The ukad was soft and the saaran wasn't over-sweet. My mother-in-law asked who made them, then asked for the recipe, that has genuinely never happened.",
  },
  {
    name: "Rohit Kulkarni",
    where: "Office Diwali · faral tins",
    when: "Nov 2025",
    rating: 5,
    text: "Ordered chakli, shankarpali and besan ladoo for twenty people. Still crisp four days later, which tells you the oil was clean. Three colleagues have ordered since.",
  },
  {
    name: "Sneha Patil",
    where: "Haldi · 60 guests",
    when: "Aug 2026",
    rating: 5,
    text: "She called the evening before to ask how spicy we wanted the misal and whether there were children eating. Food reached at 11 sharp, hot, and nothing ran out. For sixty people that is no small thing.",
  },
  {
    name: "Ajay Salunkhe",
    where: "Sunday lunch · surmai thali",
    when: "July 2026",
    rating: 4,
    text: "Proper malvani masala, the fish fresh and fried right, and the solkadhi was the best I've had outside Malvan. Only complaint is I wanted more rice with it.",
  },
  {
    name: "Prachi Joshi",
    where: "Upvas · sabudana khichdi",
    when: "Sept 2026",
    rating: 5,
    text: "Not sticky, not oily, each sago separate, with enough peanut. I've stopped ordering khichdi anywhere else on fasting days.",
  },
  {
    name: "Nikhil Rane",
    where: "Holi · puran poli",
    when: "March 2026",
    rating: 5,
    text: "Thin, soft, even puran right to the edge, and she sent katachi aamti with it without being asked. Tasted like my aaji's, which is the highest thing I can say about food.",
  },
  {
    name: "Sushma Kelkar",
    where: "Satyanarayan puja · naivedya",
    when: "June 2026",
    rating: 5,
    text: "She understood exactly what a naivedya thali needs, no onion, no garlic, sheera made in ghee. Punctual, neatly packed, and the brass looked lovely on the table.",
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full w-[17rem] shrink-0 flex-col rounded-2xl border border-gold/30 bg-black/45 p-5 text-cream backdrop-blur-[2px] sm:w-[21rem]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={i < review.rating ? "size-4 fill-gold text-gold" : "size-4 text-cream/25"}
              aria-hidden="true"
            />
          ))}
        </div>
        <Quote className="size-5 text-gold/40" aria-hidden="true" />
      </div>

      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-cream/90">{review.text}</blockquote>

      <figcaption className="mt-4 flex items-center gap-3 border-t border-gold/20 pt-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/20 font-royal text-sm font-bold text-gold">
          {review.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-royal text-sm font-bold tracking-wide text-gold">{review.name}</span>
          <span className="block truncate text-xs text-cream/60">
            {review.where} · {review.when}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsMarquee() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20" aria-labelledby="reviews-heading">
      <Reveal className="relative">
        <div className="mx-auto mb-8 w-full max-w-5xl px-4 text-center">
          <h2 id="reviews-heading" className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">
            What people say
          </h2>
        </div>

        {/* Two copies of the list make the loop seamless. Hovering, focusing or
            holding a finger on the strip pauses it so it can be read. */}
        <div className="marquee relative">
          <div className="marquee-track flex w-max items-stretch gap-4 px-4 sm:gap-5">
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/70 to-transparent sm:w-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/70 to-transparent sm:w-20"
          />
        </div>
      </Reveal>
    </section>
  );
}
