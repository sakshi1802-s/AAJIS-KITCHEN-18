import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MenuItemDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { getAvailability } from "@/features/menu/availability";
import { useCart } from "./cartContext";

/**
 * Add, then a stepper. The stepper is capped at what the kitchen actually has
 * left; the server re-checks that cap when the order is placed.
 */
export function AddToCartButton({ item }: { item: MenuItemDTO }) {
  const { add, setQuantity, quantityOf } = useCart();
  const quantity = quantityOf(item.id);
  const { canOrder, maxQuantity } = getAvailability(item);

  if (!canOrder) {
    return (
      <Button size="lg" disabled className="rounded-full">
        Unavailable
      </Button>
    );
  }

  if (quantity === 0) {
    return (
      <Button
        size="lg"
        className="rounded-full"
        onClick={() => {
          add(item);
          toast.success(`${item.name} added`, { description: `Minimum ${item.minQuantity} ${item.unitLabel}` });
        }}
      >
        <Plus /> Add
      </Button>
    );
  }

  const atMax = quantity >= maxQuantity;
  const step = () => {
    if (atMax) {
      toast.info(`Only ${maxQuantity} left today`);
      return;
    }
    setQuantity(item.id, quantity + 1);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background p-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label={quantity <= item.minQuantity ? `Remove ${item.name}` : `One less ${item.name}`}
        onClick={() => setQuantity(item.id, quantity <= item.minQuantity ? 0 : quantity - 1)}
      >
        <Minus />
      </Button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label={`One more ${item.name}`}
        disabled={atMax}
        onClick={step}
      >
        <Plus />
      </Button>
    </div>
  );
}
