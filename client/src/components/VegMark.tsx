import { cn } from "@/lib/utils";

/**
 * The FSSAI food-type symbol Indian customers read instantly:
 * a green dot in a green square for veg, a brown triangle for non-veg.
 */
export function VegMark({ isVeg, className }: { isVeg: boolean; className?: string }) {
  const color = isVeg ? "#2F7D32" : "#7A3E1D";
  return (
    <span
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Veg" : "Non-veg"}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] bg-card",
        className,
      )}
      style={{ borderColor: color }}
    >
      {isVeg ? (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      ) : (
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
          <path d="M5 1 9.2 8.6H.8Z" fill={color} />
        </svg>
      )}
    </span>
  );
}
