import type { ReactNode } from "react";
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
  /** The add-to-cart control (wired in Phase 3). */
  action?: ReactNode;
  eagerImage?: boolean;
}

export function MenuCard({ item, action, eagerImage }: MenuCardProps) {
  const availability = getAvailability(item);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow hover:shadow-md",
        !availability.canOrder && "opacity-90",
      )}
      aria-labelledby={`dish-${item.id}`}
    >
      <div className="relative">
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
              "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
              BADGE_TONES[availability.badge.tone],
            )}
          >
            {availability.badge.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} className="mt-1.5" />
          <div className="min-w-0">
            <h3 id={`dish-${item.id}`} className="text-lg leading-snug font-semibold">
              {item.name}
            </h3>
            {item.nameMarathi && (
              <p lang="mr" className="text-sm text-muted-foreground">
                {item.nameMarathi}
              </p>
            )}
          </div>
        </div>

        {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}

        <p className="text-xs text-muted-foreground">
          Serves ~{item.servesApprox} · Min. {item.minQuantity}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p>
            <span className="text-lg font-semibold text-maroon">{formatINR(item.price)}</span>{" "}
            <span className="text-sm text-muted-foreground">{item.unitLabel}</span>
          </p>
          {action}
        </div>
      </div>
    </article>
  );
}
