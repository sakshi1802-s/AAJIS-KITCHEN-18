import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { MenuItemDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { MenuCard } from "@/features/menu/MenuCard";

/** Featured dishes, swipeable on a phone and arrow-driven on a desktop. */
export function FeaturedCarousel({ items }: { items: MenuItemDTO[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    // Next frame, so the first read isn't a synchronous setState in the effect.
    const frame = requestAnimationFrame(sync);
    embla.on("select", sync).on("reInit", sync);
    return () => {
      cancelAnimationFrame(frame);
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {items.map((item) => (
            <div key={item.id} className="min-w-0 flex-[0_0_85%] min-[520px]:flex-[0_0_48%] lg:flex-[0_0_32%]">
              <MenuCard item={item} action={<AddToCartButton item={item} />} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label="Previous dishes"
          disabled={!canPrev}
          onClick={() => embla?.scrollPrev()}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label="More dishes"
          disabled={!canNext}
          onClick={() => embla?.scrollNext()}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
