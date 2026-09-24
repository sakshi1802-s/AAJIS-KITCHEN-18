import { useMutation } from "@tanstack/react-query";
import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { AiSuggestResponse } from "@shared/api";
import { DishImage } from "@/components/DishImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useCart } from "@/features/cart/cartContext";
import { ApiError, api } from "@/lib/api";
import { formatINR } from "@/lib/format";

const EXAMPLES = [
  "haldi at home, 60 log, mostly veg, kuch sweet bhi chahiye",
  "Ganpati visarjan lunch for 25 people",
  "upvas food for 12, nothing fried",
];

export function PlanMyOrderPage() {
  const { user } = useAuth();
  const { add, setQuantity } = useCart();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState<AiSuggestResponse | null>(null);

  const suggest = useMutation({
    mutationFn: (input: string) => api.post<AiSuggestResponse>("/ai/suggest", { text: input }),
    onSuccess: setSuggestion,
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Couldn't put a suggestion together."),
  });

  const useThis = () => {
    if (!suggestion) return;
    for (const line of suggestion.items) {
      add(line.item, line.quantity);
      setQuantity(line.item.id, line.quantity);
    }
    toast.success("Added to your cart — change anything you like");
    void navigate("/cart");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-maroon">
          <Sparkles className="size-4" aria-hidden="true" /> Optional helper
        </p>
        <h1 className="mt-3 font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">Plan my order</h1>
        <p className="mt-2 text-cream/80">
          Describe the occasion and we'll suggest a spread from Aji's menu. Every suggestion is editable, and you
          can always{" "}
          <Link to="/menu" className="underline">
            pick dishes yourself
          </Link>
          .
        </p>
      </header>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <Label htmlFor="plan-text">What's the occasion?</Label>
          <textarea
            id="plan-text"
            rows={3}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="haldi at home, 60 log, mostly veg, kuch sweet bhi chahiye"
            className="mt-1.5 w-full rounded-xl border bg-background p-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setText(example)}
                className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                {example}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-4 h-12 rounded-full px-6 text-base"
            disabled={text.trim().length < 4 || suggest.isPending}
            onClick={() => (user ? suggest.mutate(text.trim()) : void navigate("/signin", { state: { from: "/plan" } }))}
          >
            <Wand2 /> {suggest.isPending ? "Thinking…" : user ? "Suggest a spread" : "Sign in to use this"}
          </Button>
        </CardContent>
      </Card>

      {suggest.isPending && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {suggestion && !suggest.isPending && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Suggested spread</CardTitle>
            <p className="text-muted-foreground">{suggestion.summary}</p>
            {suggestion.source === "fallback" && (
              <p className="text-sm text-muted-foreground">
                Put together by matching your words to the menu — have a look and change what you like.
              </p>
            )}
          </CardHeader>
          <CardContent>
            {suggestion.items.length === 0 ? (
              <p className="text-muted-foreground">
                Nothing came back for that.{" "}
                <Link to="/menu" className="underline">
                  Browse the menu instead
                </Link>
                .
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {suggestion.items.map((line) => (
                    <li key={line.item.id} className="flex items-center gap-3 rounded-2xl border p-3">
                      <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                        <DishImage
                          src={line.item.imageUrl}
                          name={line.item.name}
                          nameMarathi={line.item.nameMarathi}
                          category={line.item.category}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {line.item.name} <span className="text-muted-foreground">× {line.quantity}</span>
                        </p>
                        {line.reason && <p className="text-sm text-muted-foreground">{line.reason}</p>}
                        <p className="text-sm text-muted-foreground">
                          {formatINR(line.item.price)} {line.item.unitLabel}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums">{formatINR(line.lineTotal)}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-heading text-2xl font-semibold text-maroon tabular-nums">
                    {formatINR(suggestion.total)}
                  </span>
                </div>

                <Button size="lg" className="mt-4 h-12 w-full rounded-full text-base" onClick={useThis}>
                  Use this — I'll adjust it
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
