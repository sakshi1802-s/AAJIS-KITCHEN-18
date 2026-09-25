import { ShoppingBasket } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "./cartContext";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Button asChild variant="ghost" size="icon" className="relative size-9 rounded-full">
      <Link
        to="/cart"
        aria-label={itemCount > 0 ? `Plate, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : "Plate, empty"}
      >
        <ShoppingBasket />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-semibold text-primary-foreground tabular-nums">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
