import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { MenuItemDTO } from "@shared/api";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { MenuCard } from "./MenuCard";

/**
 * Animation 2 of 5: menu cards rise as they scroll into view, staggered a
 * little so the grid fills like a tray being laid out.
 */
export function MenuGrid({ items, className }: { items: MenuItemDTO[]; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={className}>
      {items.map((item, i) => {
        const card: ReactNode = (
          <MenuCard item={item} eagerImage={i < 2} action={<AddToCartButton item={item} />} />
        );
        if (reduceMotion) return <div key={item.id}>{card}</div>;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: Math.min(i, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {card}
          </motion.div>
        );
      })}
    </div>
  );
}
