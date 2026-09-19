import { ArrowRight, CalendarClock, HandPlatter, ShoppingBasket } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { MenuCard } from "@/features/menu/MenuCard";
import { useMenu } from "@/features/menu/useMenu";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  { icon: ShoppingBasket, title: "Pick your dishes", body: "Browse the menu and fill your cart — a plate of pohe or a whole haldi spread." },
  { icon: CalendarClock, title: "Say when", body: "This evening, tomorrow morning, next Sunday. Add notes like “kam tikhat”." },
  { icon: HandPlatter, title: "Aji confirms", body: "She looks at every order herself and accepts it. You'll see it the moment she does." },
];

/**
 * Phase 1 landing page: hero, how it works, a few featured dishes.
 * The Phase 5 design pass adds the hero animation and the carousel.
 */
export function LandingPage() {
  const menu = useMenu();
  const featured = (menu.data ?? []).filter((d) => d.isAvailable && d.tags.includes("festive")).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:py-20 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p lang="mr" className="text-lg text-terracotta">
              आजीच्या हातची चव
            </p>
            <h1 className="mt-2 text-5xl leading-[1.05] font-semibold text-maroon sm:text-6xl">
              Home-made, the way Aji makes it.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Pohe for a Sunday breakfast, modak for Ganpati, a full spread for the haldi. Traditional Maharashtrian
              food, cooked to order in a home kitchen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                <Link to="/menu">
                  See the menu <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6 text-base">
                <a href="#how-it-works">How ordering works</a>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-terracotta" />
            <div className="absolute inset-[9%] rounded-full bg-cream" />
            <div className="absolute inset-[18%] rounded-full border-2 border-dashed border-saffron" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span lang="mr" className="font-marathi text-5xl font-semibold text-maroon">
                आजी
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14">
        <h2 className="text-3xl font-semibold text-maroon">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border bg-card p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-maroon">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}.</span> {title}
              </h3>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold text-maroon">For the festive table</h2>
          <Link to="/menu" className="text-sm font-medium text-terracotta hover:underline">
            Full menu →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3">
          {menu.isPending
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
            : featured.map((item) => <MenuCard key={item.id} item={item} />)}
        </div>
      </section>
    </>
  );
}
