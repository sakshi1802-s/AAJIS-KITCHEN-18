import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, type Category } from "@shared/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MenuFiltersProps {
  category: Category | undefined;
  onCategoryChange: (category: Category | undefined) => void;
  vegOnly: boolean;
  onVegOnlyChange: (vegOnly: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:border-primary/40 hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function MenuFilters(props: MenuFiltersProps) {
  const { category, onCategoryChange, vegOnly, onVegOnlyChange, search, onSearchChange } = props;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="menu-search" className="sr-only">
            Search dishes
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="menu-search"
            type="search"
            inputMode="search"
            placeholder="Search pohe, modak…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 rounded-full bg-card pr-10 pl-10 text-base"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex h-11 shrink-0 items-center gap-2 rounded-full border bg-card px-3 sm:px-4">
          <Switch id="veg-only" checked={vegOnly} onCheckedChange={onVegOnlyChange} />
          <Label htmlFor="veg-only" className="text-sm font-medium">
            Veg<span className="sr-only sm:not-sr-only">&nbsp;only</span>
          </Label>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        <Chip active={!category} onClick={() => onCategoryChange(undefined)}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => onCategoryChange(category === c ? undefined : c)}>
            {CATEGORY_LABELS[c].en}
          </Chip>
        ))}
      </div>
    </div>
  );
}
