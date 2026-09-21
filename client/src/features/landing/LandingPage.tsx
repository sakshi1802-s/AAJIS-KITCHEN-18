import { ArrowRight, CalendarClock, HandPlatter, ShoppingBasket } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenu } from "@/features/menu/useMenu";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { useSmoothScroll } from "./useSmoothScroll";

const STEPS = [
  {
    icon: ShoppingBasket,
    title: "Pick your dishes",
    body: "Browse the menu and fill your cart — a plate of pohe or a whole haldi spread.",
  },
  {
    icon: CalendarClock,
    title: "Say when",
    body: "This evening, tomorrow morning, next Sunday. Add notes like “kam tikhat”.",
  },
  {
    icon: HandPlatter,
    title: "Aji confirms",
    body: "She looks at every order herself and accepts it. You'll see it the moment she does.",
  },
];

const HERO_WORDS = ["Home-made,", "the way", "Aji makes it."];

export function LandingPage() {
  const menu = useMenu();
  const reduceMotion = useReducedMotion();
  useSmoothScroll();

  const featured = (menu.data ?? []).filter((dish) => dish.isAvailable).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b bg-secondary/40">
        {/* A warm wash behind the hero, rather than a stock photo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-saffron/20 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:py-20 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <motion.p
              lang="mr"
              className="text-lg text-terracotta"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              आजीच्या हातची चव
            </motion.p>

            {/* Animation 1 of 5: the hero settles line by line. */}
            <h1 className="mt-2 text-5xl leading-[1.05] font-semibold text-maroon sm:text-6xl">
              {HERO_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  className="block"
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mt-5 max-w-lg text-lg text-muted-foreground"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
            >
              Pohe for a Sunday breakfast, modak for Ganpati, a full spread for the haldi. Traditional Maharashtrian
              food, cooked to order in a home kitchen.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
            >
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                <Link to="/menu">
                  See the menu <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6 text-base">
                <a href="#how-it-works">How ordering works</a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto aspect-square w-full max-w-sm"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.15 }}
          >
            <div className="absolute inset-0 rounded-full bg-terracotta" />
            <div className="absolute inset-[9%] rounded-full bg-cream" />
            <motion.div
              className="absolute inset-[18%] rounded-full border-2 border-dashed border-saffron"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span lang="mr" className="font-marathi text-5xl font-semibold text-maroon">
                आजी
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14">
        <h2 className="text-3xl font-semibold text-maroon">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.li
              key={title}
              className="rounded-2xl border bg-card p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-maroon">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}.</span> {title}
              </h3>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold text-maroon">From the kitchen</h2>
          <Link to="/menu" className="text-sm font-medium text-terracotta hover:underline">
            Full menu →
          </Link>
        </div>
        <div className="mt-6">
          {menu.isPending ? (
            <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <FeaturedCarousel items={featured} />
          ) : (
            <p className="text-muted-foreground">The menu is being written — check back soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
