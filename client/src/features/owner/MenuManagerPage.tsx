import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MenuItemDTO } from "@shared/api";
import { DishImage } from "@/components/DishImage";
import { ErrorState } from "@/components/states/ErrorState";
import { VegMark } from "@/components/VegMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMenu } from "@/features/menu/useMenu";
import { ApiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { MenuItemForm } from "./MenuItemForm";
import { useDeleteMenuItem, useUpdateMenuItem } from "./useOwner";

export function MenuManagerPage() {
  const menu = useMenu();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const [editing, setEditing] = useState<MenuItemDTO | "new" | null>(null);
  const [deleting, setDeleting] = useState<MenuItemDTO | null>(null);

  const failed = (error: unknown) =>
    toast.error(error instanceof ApiError ? error.message : "That didn't work. Please try again.");

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{editing === "new" ? "Add a dish" : `Edit ${editing.name}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemForm item={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">My menu</h1>
        <Button size="lg" className="h-12 text-base" onClick={() => setEditing("new")}>
          <Plus /> Add dish
        </Button>
      </div>

      {menu.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : menu.isError ? (
        <ErrorState title="Couldn't load your menu" error={menu.error} onRetry={() => void menu.refetch()} />
      ) : (
        <ul className="space-y-3">
          {menu.data.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
              <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                <DishImage
                  src={item.imageUrl}
                  name={item.name}
                  nameMarathi={item.nameMarathi}
                  category={item.category}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-lg font-semibold">
                  <VegMark isVeg={item.isVeg} />
                  <span className="truncate">{item.name}</span>
                </p>
                <p className="text-base text-muted-foreground">
                  {formatINR(item.price)} {item.unitLabel} ·{" "}
                  {item.stockCount === null ? "made to order" : `${item.stockCount} left`}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1">
                <Switch
                  checked={item.isAvailable}
                  aria-label={`${item.name} available today`}
                  disabled={updateItem.isPending}
                  onCheckedChange={(checked) =>
                    updateItem.mutate(
                      { id: item.id, isAvailable: checked },
                      {
                        onSuccess: () => toast.success(checked ? `${item.name} is on` : `${item.name} is off`),
                        onError: failed,
                      },
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">{item.isAvailable ? "On" : "Off"}</span>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleting?.name}?</DialogTitle>
            <DialogDescription>
              It disappears from the menu. Past orders that included it are untouched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="lg" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              size="lg"
              variant="destructive"
              disabled={deleteItem.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteItem.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.success(`${deleting.name} removed`);
                    setDeleting(null);
                  },
                  onError: failed,
                });
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
