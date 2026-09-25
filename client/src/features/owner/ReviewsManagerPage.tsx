import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { ReviewDTO } from "@shared/api";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Stars } from "@/features/reviews/Stars";
import { useAllReviews, useSetReviewPublished } from "@/features/reviews/useReviews";
import { ApiError } from "@/lib/api";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function ReviewRow({ review }: { review: ReviewDTO }) {
  const setPublished = useSetReviewPublished();

  const toggle = async () => {
    try {
      await setPublished.mutateAsync({ id: review.id, isPublished: !review.isPublished });
      toast.success(review.isPublished ? "Taken off the home page" : "Now on the home page");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save that. Try again.");
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-royal text-lg font-bold">{review.name}</p>
            <p className="text-sm text-muted-foreground">
              {review.occasion ? `${review.occasion} · ` : ""}
              {formatDate(review.createdAt)}
            </p>
          </div>
          <Badge variant={review.isPublished ? "default" : "secondary"}>
            {review.isPublished ? "Showing" : "Hidden"}
          </Badge>
        </div>

        <Stars rating={review.rating} />
        <p className="text-[0.95rem] leading-relaxed">{review.text}</p>

        <Button
          size="lg"
          variant={review.isPublished ? "outline" : "default"}
          className="w-full"
          disabled={setPublished.isPending}
          onClick={() => void toggle()}
        >
          {review.isPublished ? <EyeOff /> : <Eye />}
          {review.isPublished ? "Hide from the home page" : "Show on the home page"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Aaji decides which reviews the home page shows. Nothing a customer writes
 * appears until she taps Show here.
 */
export function ReviewsManagerPage() {
  const reviews = useAllReviews();

  if (reviews.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (reviews.isError) {
    return <ErrorState title="Couldn't load the reviews" error={reviews.error} onRetry={() => void reviews.refetch()} />;
  }

  if (reviews.data.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="When a customer writes one, it waits here until you choose to show it."
      />
    );
  }

  const waiting = reviews.data.filter((review) => !review.isPublished).length;

  return (
    <div className="space-y-4">
      <p className="text-cream/80">
        {waiting === 0
          ? "Everything here has been seen."
          : `${waiting} ${waiting === 1 ? "review is" : "reviews are"} waiting for you.`}
      </p>
      <div className="space-y-3">
        {reviews.data.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
