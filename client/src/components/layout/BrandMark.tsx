import { cn } from "@/lib/utils";

/** The little clay-plate logo, shared with the favicon. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden="true">
      <circle cx="32" cy="32" r="30" className="fill-terracotta" />
      <circle cx="32" cy="32" r="21" className="fill-cream" />
      <path d="M32 18c-5 7-9 11-9 16a9 9 0 0 0 18 0c0-5-4-9-9-16z" className="fill-saffron" />
    </svg>
  );
}
