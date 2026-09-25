import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only rating, used on every review card. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("size-4", i < rating ? "fill-[#b45309] text-[#b45309]" : "text-[#8a6a4a]/35")}
        />
      ))}
    </span>
  );
}

/** The same five stars, but pickable. Arrow keys work because they are buttons. */
export function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div role="group" aria-label="Your rating" className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        return (
          <button
            key={rating}
            type="button"
            aria-pressed={value === rating}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
            onClick={() => onChange(rating)}
            className="rounded-full p-1 outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-[#9a3412]/40"
          >
            <Star
              aria-hidden="true"
              className={cn("size-7", rating <= value ? "fill-[#b45309] text-[#b45309]" : "text-[#8a6a4a]/40")}
            />
          </button>
        );
      })}
    </div>
  );
}
