import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, type Category, type MenuItemDTO, type MenuItemInput } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/constants";
import { paiseToRupees, rupeesToPaise } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreateMenuItem, useUpdateMenuItem } from "./useOwner";

interface MenuItemFormProps {
  item?: MenuItemDTO;
  onDone: () => void;
}

/**
 * Aaji types rupees; the API only ever sees paise. That conversion happens here
 * and nowhere else.
 */
export function MenuItemForm({ item, onDone }: MenuItemFormProps) {
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();

  const [name, setName] = useState(item?.name ?? "");
  const [nameMarathi, setNameMarathi] = useState(item?.nameMarathi ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState<Category>(item?.category ?? "snacks");
  const [unitLabel, setUnitLabel] = useState(item?.unitLabel ?? "per plate");
  const [rupees, setRupees] = useState(item ? String(paiseToRupees(item.price)) : "");
  const [minQuantity, setMinQuantity] = useState(String(item?.minQuantity ?? 1));
  const [servesApprox, setServesApprox] = useState(String(item?.servesApprox ?? 1));
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [limited, setLimited] = useState(item?.stockCount !== null && item !== undefined);
  const [stockCount, setStockCount] = useState(String(item?.stockCount ?? 10));
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [tags, setTags] = useState((item?.tags ?? []).join(", "));

  const busy = createItem.isPending || updateItem.isPending;
  const priceValid = rupees.trim() !== "" && Number(rupees) > 0;

  const submit = async () => {
    if (!name.trim() || !priceValid) {
      toast.error("A dish needs a name and a price.");
      return;
    }

    const body: MenuItemInput = {
      name: name.trim(),
      nameMarathi: nameMarathi.trim(),
      description: description.trim(),
      category,
      unitLabel: unitLabel.trim(),
      price: rupeesToPaise(Number(rupees)),
      minQuantity: Math.max(1, Number(minQuantity) || 1),
      servesApprox: Math.max(1, Number(servesApprox) || 1),
      isAvailable,
      stockCount: limited ? Math.max(0, Number(stockCount) || 0) : null,
      imageUrl: imageUrl.trim() || null,
      isVeg,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (item) await updateItem.mutateAsync({ id: item.id, ...body });
      else await createItem.mutateAsync(body);
      toast.success(item ? "Dish updated" : "Dish added");
      onDone();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save that dish.");
    }
  };

  const field = "mt-1.5 h-12 text-base";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dish-name">Name</Label>
          <Input id="dish-name" className={field} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="dish-name-mr">Marathi name</Label>
          <Input
            id="dish-name-mr"
            lang="mr"
            className={field}
            value={nameMarathi}
            onChange={(e) => setNameMarathi(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dish-description">Description</Label>
        <textarea
          id="dish-description"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5 w-full rounded-xl border bg-background p-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Category</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={cn(
                "rounded-full border px-4 py-2.5 text-base transition-colors",
                category === option ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {CATEGORY_LABELS[option].en}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dish-price">Price (₹)</Label>
          <Input
            id="dish-price"
            className={field}
            inputMode="decimal"
            value={rupees}
            onChange={(e) => setRupees(e.target.value)}
            aria-invalid={rupees !== "" && !priceValid}
          />
        </div>
        <div>
          <Label htmlFor="dish-unit">Unit</Label>
          <Input
            id="dish-unit"
            className={field}
            placeholder="per plate, per kg, per piece"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dish-min">Minimum order</Label>
          <Input
            id="dish-min"
            className={field}
            inputMode="numeric"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dish-serves">Serves about</Label>
          <Input
            id="dish-serves"
            className={field}
            inputMode="numeric"
            value={servesApprox}
            onChange={(e) => setServesApprox(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="dish-available" className="text-base">
            Available today
          </Label>
          <Switch id="dish-available" checked={isAvailable} onCheckedChange={setIsAvailable} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="dish-veg" className="text-base">
            Vegetarian
          </Label>
          <Switch id="dish-veg" checked={isVeg} onCheckedChange={setIsVeg} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="dish-limited" className="text-base">
            Fixed batch
            <span className="block text-sm font-normal text-muted-foreground">
              Off means you'll make more as orders come in
            </span>
          </Label>
          <Switch id="dish-limited" checked={limited} onCheckedChange={setLimited} />
        </div>
        {limited && (
          <div>
            <Label htmlFor="dish-stock">How many are left?</Label>
            <Input
              id="dish-stock"
              className={field}
              inputMode="numeric"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dish-image">Photo link</Label>
          <Input
            id="dish-image"
            className={field}
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dish-tags">Tags (comma separated)</Label>
          <Input
            id="dish-tags"
            className={field}
            placeholder="upvas, festive, fried"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="lg" className="h-12 text-base" disabled={busy} onClick={() => void submit()}>
          {busy ? "Saving…" : item ? "Save changes" : "Add dish"}
        </Button>
        <Button variant="ghost" size="lg" className="h-12 text-base" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
