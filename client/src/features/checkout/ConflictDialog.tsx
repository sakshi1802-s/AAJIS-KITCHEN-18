import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { CartConflict, MenuItemDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/features/cart/cartContext";
import { menuKeys } from "@/features/menu/useMenu";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

interface ConflictDialogProps {
  conflicts: CartConflict[];
  onClose: () => void;
}

/** One human sentence per thing that changed while the customer was ordering. */
function describe(conflict: CartConflict): string {
  switch (conflict.kind) {
    case "NOT_FOUND":
      return "This dish is no longer on the menu.";
    case "UNAVAILABLE":
      return `${conflict.name} isn't available today.`;
    case "INSUFFICIENT_STOCK":
      return conflict.available === 0
        ? `${conflict.name} is now sold out.`
        : `You asked for ${conflict.requested}, but only ${conflict.available} are left.`;
    case "PRICE_CHANGED":
      return `${conflict.name} is now ${formatINR(conflict.newPrice)}, it was ${formatINR(conflict.oldPrice)}.`;
    case "BELOW_MINIMUM":
      return `${conflict.name} now has a minimum order of ${conflict.minQuantity}.`;
  }
}

/**
 * The 409 screen. The server refuses the order and sends a diff of exactly
 * what changed; the customer sees it in plain words and re-confirms. Nothing
 * is silently adjusted behind their back.
 */
export function ConflictDialog({ conflicts, onClose }: ConflictDialogProps) {
  const { remove, reconcile, setQuantity } = useCart();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const updateCart = async () => {
    setUpdating(true);
    try {
      for (const conflict of conflicts) {
        if (conflict.kind === "NOT_FOUND" || conflict.kind === "UNAVAILABLE") {
          remove(conflict.menuItemId);
          continue;
        }
        if (conflict.kind === "INSUFFICIENT_STOCK" && conflict.available === 0) {
          remove(conflict.menuItemId);
          continue;
        }
        // Re-read the dish so the cart line matches the database exactly.
        const fresh = await api.get<MenuItemDTO>(`/menu/${conflict.menuItemId}`).catch(() => null);
        if (!fresh) {
          remove(conflict.menuItemId);
          continue;
        }
        reconcile(fresh);
        if (conflict.kind === "INSUFFICIENT_STOCK") setQuantity(conflict.menuItemId, conflict.available);
      }
      await queryClient.invalidateQueries({ queryKey: menuKeys.all });
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aaji's kitchen changed something</DialogTitle>
          <DialogDescription>
            Your order hasn't been placed. Here's what's different, update your cart and try again.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {conflicts.map((conflict, i) => (
            <li key={`${conflict.menuItemId}-${i}`} className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
              {describe(conflict)}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Leave my cart alone
          </Button>
          <Button onClick={() => void updateCart()} disabled={updating}>
            {updating ? "Updating…" : "Update my cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
