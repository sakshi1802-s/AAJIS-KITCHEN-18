import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { DishImage } from "@/components/DishImage";
import { EmptyState } from "@/components/states/EmptyState";
import { VegMark } from "@/components/VegMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";
import { formatINR } from "@/lib/format";
import { useCart } from "./cartContext";

export function CartPage() {
  const { lines, total, setQuantity, remove, clear } = useCart();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <EmptyState
        className="py-20"
        title="Your cart is empty"
        description="Add a few dishes from the menu and tell Aaji when you'd like them."
        action={
          <Button asChild size="lg" className="rounded-full">
            <Link to="/menu">See the menu</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">Your cart</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-cream/80 hover:bg-white/10 hover:text-cream" onClick={clear}>
          Clear
        </Button>
      </header>

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
        {lines.map((line) => (
          <motion.li
            key={line.menuItemId}
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-3 rounded-2xl border bg-card p-3"
          >
            <div className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
              <DishImage
                src={line.imageUrl}
                name={line.name}
                nameMarathi={line.nameMarathi}
                category={line.category}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start gap-2">
                <VegMark isVeg={line.isVeg} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{line.name}</p>
                  {line.nameMarathi && (
                    <p lang="mr" className="text-sm text-muted-foreground">
                      {line.nameMarathi}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatINR(line.price)} {line.unitLabel}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => remove(line.menuItemId)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-full border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full"
                    aria-label={`One less ${line.name}`}
                    onClick={() =>
                      setQuantity(line.menuItemId, line.quantity <= line.minQuantity ? 0 : line.quantity - 1)
                    }
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-8 text-center font-semibold tabular-nums">{line.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full"
                    aria-label={`One more ${line.name}`}
                    onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
                <p className="font-semibold text-maroon tabular-nums">{formatINR(line.price * line.quantity)}</p>
              </div>
            </div>
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium">Total</span>
          <span className="font-heading text-2xl font-semibold text-maroon tabular-nums">{formatINR(total)}</span>
        </div>
        <Button
          size="lg"
          className="mt-4 h-12 w-full rounded-full text-base"
          onClick={() => void navigate(user ? "/checkout" : "/signin", user ? undefined : { state: { from: "/checkout" } })}
        >
          {user ? "Continue to checkout" : "Sign in to order"} <ArrowRight data-icon="inline-end" />
        </Button>
        <Button asChild variant="ghost" size="lg" className="mt-2 w-full">
          <Link to="/menu">Add more dishes</Link>
        </Button>
      </div>
    </div>
  );
}
