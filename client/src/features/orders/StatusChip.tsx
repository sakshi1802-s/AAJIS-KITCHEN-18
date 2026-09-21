import { Check, Clock, X } from "lucide-react";
import type { OrderStatus } from "@shared/api";
import { cn } from "@/lib/utils";

const STATUS: Record<OrderStatus, { label: string; className: string; Icon: typeof Check }> = {
  // "Waiting", not "confirmed" — Aji hasn't seen it yet.
  PLACED: { label: "Waiting for Aji", className: "bg-saffron/25 text-maroon", Icon: Clock },
  ACCEPTED: { label: "Accepted", className: "bg-leaf/20 text-leaf", Icon: Check },
  DECLINED: { label: "Declined", className: "bg-destructive/10 text-destructive", Icon: X },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground", Icon: X },
};

export function StatusChip({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, className: tone, Icon } = STATUS[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", tone, className)}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
