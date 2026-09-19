import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A little thali — the house illustration for "nothing here yet". */
function ThaliIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="size-28" aria-hidden="true">
      <circle cx="60" cy="60" r="52" className="fill-secondary stroke-border" strokeWidth="2" />
      <circle cx="60" cy="60" r="40" className="fill-card stroke-border" strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx="42" cy="46" r="10" className="fill-saffron/40" />
      <circle cx="74" cy="42" r="8" className="fill-leaf/30" />
      <circle cx="78" cy="72" r="11" className="fill-terracotta/30" />
      <path
        d="M36 72c6 8 18 10 26 4"
        className="stroke-maroon/40"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, illustration, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      {illustration ?? <ThaliIllustration />}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
