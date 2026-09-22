import { useState } from "react";
import type { Category } from "@shared/api";
import { cn } from "@/lib/utils";

const TINTS: Record<Category, { bg: string; ring: string }> = {
  snacks: { bg: "bg-terracotta/20", ring: "stroke-terracotta" },
  faral: { bg: "bg-saffron/30", ring: "stroke-saffron" },
  "thali-veg": { bg: "bg-leaf/20", ring: "stroke-leaf" },
  "thali-nonveg": { bg: "bg-maroon/15", ring: "stroke-maroon" },
};

interface DishImageProps {
  src: string | null;
  name: string;
  nameMarathi: string;
  category: Category;
  className?: string;
  /** Above-the-fold images can skip lazy loading. */
  eager?: boolean;
}

/**
 * Dish photo with a fixed aspect ratio (no layout shift) and lazy loading.
 * Until Aji's real photos exist — or if one fails to load — it draws a warm
 * plate illustration with the dish's Marathi name instead of a broken image.
 */
export function DishImage({ src, name, nameMarathi, category, className, eager }: DishImageProps) {
  const [failed, setFailed] = useState(false);
  const tint = TINTS[category];
  const label = nameMarathi || name;

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden", tint.bg, className)}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 400 300" role="img" aria-label={name} className="absolute inset-0 size-full">
          <circle cx="200" cy="150" r="104" className="fill-card/85" />
          <circle cx="200" cy="150" r="104" fill="none" strokeWidth="5" className={tint.ring} />
          <circle
            cx="200"
            cy="150"
            r="88"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            className={tint.ring}
          />
          <text
            x="200"
            y="152"
            textAnchor="middle"
            dominantBaseline="central"
            lang="mr"
            className="fill-maroon font-marathi"
            fontSize={label.length > 14 ? 20 : label.length > 9 ? 26 : 32}
            fontWeight={600}
          >
            {label}
          </text>
        </svg>
      )}
    </div>
  );
}
