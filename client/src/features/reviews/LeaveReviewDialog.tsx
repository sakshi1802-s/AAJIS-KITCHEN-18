import { PenLine } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/api";
import { StarPicker } from "./Stars";
import { useCreateReview } from "./useReviews";

// Mirrors server/src/schemas/review.schema.ts, so the message arrives before
// the request does.
const reviewSchema = z.object({
  occasion: z.string().trim().max(80, "Keep the occasion short"),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10, "A line or two, please").max(600, "That is a little long"),
});

/**
 * A signed-in customer writes a review. It is saved straight away but stays
 * hidden until Aaji puts it on the home page, which the dialog says plainly.
 *
 * Three fields and one schema: plain state is less machinery than a form
 * library would be here.
 */
export function LeaveReviewDialog() {
  const { user } = useAuth();
  const createReview = useCreateReview();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [occasion, setOccasion] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Button asChild size="lg" variant="outline" className="rounded-full border-[#9a3412]/50 text-[#7c2d12]">
        <Link to="/signin">
          <PenLine /> Sign in to leave a review
        </Link>
      </Button>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = reviewSchema.safeParse({ occasion, rating, text });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check what you wrote.");
      return;
    }

    try {
      await createReview.mutateAsync(parsed.data);
      toast.success("Thank you", { description: "Aaji reads every one before it goes up." });
      setOccasion("");
      setText("");
      setRating(5);
      setError(null);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Couldn't send that. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full bg-[#9a3412] text-[#f8ecd5] hover:bg-[#7c2d12]">
          <PenLine /> Leave a review
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-royal text-2xl">Tell Aaji how it was</DialogTitle>
          <DialogDescription>
            It goes on the home page only if she chooses to show it. Signed in as {user.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
          <div>
            <Label className="mb-1.5 block">Rating</Label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <Label htmlFor="review-occasion">What was the occasion?</Label>
            <Input
              id="review-occasion"
              className="mt-1.5 h-11"
              placeholder="Ganpati at home, office Diwali, Sunday lunch"
              maxLength={80}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="review-text">Your review</Label>
            <textarea
              id="review-text"
              rows={5}
              maxLength={600}
              className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="What you ordered, how it arrived, how it tasted."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" size="lg" disabled={createReview.isPending}>
              {createReview.isPending ? "Sending…" : "Send to Aaji"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
