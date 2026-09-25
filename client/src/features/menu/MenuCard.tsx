import { Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { MenuItemDTO } from "@shared/api";
import { DishImage } from "@/components/DishImage";
import { VegMark } from "@/components/VegMark";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAvailability, type AvailabilityTone } from "./availability";

const BADGE_TONES: Record<AvailabilityTone, string> = {
  muted: "bg-foreground/80 text-background",
  danger: "bg-destructive text-white",
  warn: "bg-saffron text-maroon",
};

interface MenuCardProps {
  item: MenuItemDTO;
  /** The add-to-cart control. */
  action?: ReactNode;
  eagerImage?: boolean;
}

export function MenuCard({ item, action, eagerImage }: MenuCardProps) {
  const availability = getAvailability(item);
  // Hover covers a mouse; the ⓘ button covers a phone.
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-gold/30 bg-card text-foreground shadow-lg transition-shadow hover:shadow-xl",
        !availability.canOrder && "opacity-90",
      )}
      aria-labelledby={`dish-${item.id}`}
    >
      {/* The woven strip runs down both edges of every card. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[7px] bg-repeat-y opacity-90"
        style={{ backgroundImage: "url('/textures/ornament-strip.png')", backgroundSize: "100% auto" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[7px] bg-repeat-y opacity-90"
        style={{ backgroundImage: "url('/textures/ornament-strip.png')", backgroundSize: "100% auto" }}
      />

      <div className="relative mx-[7px]" onMouseLeave={() => setShowDetails(false)}>
        <DishImage
          src={item.imageUrl}
          name={item.name}
          nameMarathi={item.nameMarathi}
          category={item.category}
          eager={eagerImage}
          className={cn(!availability.canOrder && "grayscale-[60%]")}
        />

        {availability.badge && (
          <span
            className={cn(
              "absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm",
              BADGE_TONES[availability.badge.tone],
            )}
          >
            {availability.badge.label}
          </span>
        )}

        {item.description && (
          <>
            <button
              type="button"
              aria-expanded={showDetails}
              aria-label={`What's in ${item.name}?`}
              onClick={() => setShowDetails((open) => !open)}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm outline-none backdrop-blur-sm transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Info className="size-3.5" />
            </button>

            {/* What's in it, on hover for a mouse, on tap for a phone. */}
            <div
              className={cn(
                "absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/70 to-black/25 p-3 transition-opacity duration-200",
                showDetails ? "opacity-100" : "pointer-events-none opacity-0 sm:group-hover:opacity-100",
              )}
            >
              <p className="text-xs leading-snug text-white">{item.description}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} className="mt-1" />
          <div className="min-w-0">
            <h3 id={`dish-${item.id}`} className="font-royal text-[0.95rem] leading-snug font-bold">
              {item.name}
            </h3>
            {item.nameMarathi && (
              <p lang="mr" className="font-display-mr text-sm text-terracotta">
                {item.nameMarathi}
              </p>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <p className="leading-tight">
            <span className="font-royal text-base font-bold text-maroon">{formatINR(item.price)}</span>
            <span className="block text-[11px] text-muted-foreground">{item.unitLabel}</span>
          </p>
          {action}
        </div>
      </div>
    </article>
  );
}
