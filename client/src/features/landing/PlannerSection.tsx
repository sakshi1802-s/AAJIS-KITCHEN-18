import { Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "@/components/Reveal";

/** What a first-time customer is actually wondering, in the order they wonder it. */
const STEPS = [
  { n: "1", title: "Tell it the occasion", body: "A haldi for sixty. Diwali faral for the office. Upvas for twelve." },
  { n: "2", title: "It reads Aaji's menu", body: "Only dishes she is cooking today, at the prices she set. It never invents either." },
  { n: "3", title: "Change anything", body: "It is a suggestion, not an order. Adjust the quantities, drop what you like, then send it to her." },
];

/**
 * Section three: the planner exists, and nobody arriving for the first time
 * would guess it from a nav link called "Planner AI". This says what it is in
 * one line, shows the three steps, and hands them a button.
 */
export function PlannerSection() {
  return (
    <section className="relative flex min-h-[62svh] items-center justify-center px-4 py-14" aria-labelledby="planner-heading">
      <Reveal className="w-full max-w-3xl">
        <div
          className="rounded-2xl border border-[#9a3412]/30 bg-[#e8d5b0] bg-repeat p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-9"
          style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#9a3412]/15 text-[#9a3412]">
            <Sparkles className="size-6" aria-hidden="true" />
          </span>

          <p lang="mr" className="mt-3 font-display-mr text-2xl text-[#9a3412] sm:text-3xl">
            काय बनवायचं ठरत नाहीये?
          </p>
          <h2 id="planner-heading" className="mt-1 font-royal text-2xl font-bold tracking-wide text-[#4a2410] sm:text-3xl">
            Not sure what to order?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[1.02rem] leading-relaxed text-[#5b3620]">
            Let the planner work it out. Say who you are feeding and what the day is, and it puts a spread together
            from Aaji's own menu.
          </p>

          <ol className="mt-7 grid gap-5 text-left sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#9a3412] font-royal text-sm font-bold text-[#f8ecd5]">
                  {step.n}
                </span>
                <h3 className="mt-2.5 font-royal text-base font-bold text-[#4a2410]">{step.title}</h3>
                <p className="mt-1 text-sm leading-snug text-[#5b3620]">{step.body}</p>
              </li>
            ))}
          </ol>

          <Link
            to="/plan"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#9a3412] px-8 py-3.5 font-royal text-base font-bold tracking-wide text-[#f8ecd5] outline-none transition-colors hover:bg-[#7c2d12] focus-visible:ring-3 focus-visible:ring-[#9a3412]/40"
          >
            <Sparkles className="size-5" aria-hidden="true" /> Plan my menu
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
