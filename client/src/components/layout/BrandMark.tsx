import { cn } from "@/lib/utils";

/** Aaji's mark — the copper pot, used for the favicon and beside the wordmark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo/aji-logo.webp"
      alt=""
      aria-hidden="true"
      className={cn("size-8 rounded-full object-cover select-none", className)}
      loading="lazy"
      decoding="async"
    />
  );
}
