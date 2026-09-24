import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/features/checkout/useOrders";
import { SLOT_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { StatusChip } from "./StatusChip";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export function MyOrdersPage() {
  const orders = useMyOrders();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">Your orders</h1>

      <div className="mt-6">
        {orders.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : orders.isError ? (
          <ErrorState title="Couldn't load your orders" error={orders.error} onRetry={() => void orders.refetch()} />
        ) : orders.data.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order, it'll show up here with its status."
            action={
              <Button asChild size="lg" className="rounded-full">
                <Link to="/menu">See the menu</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {orders.data.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{order.orderNumber}</span>
                      <StatusChip status={order.status} />
                    </div>
                    <p className="mt-1.5 truncate font-medium">
                      {order.items.map((item) => `${item.nameSnapshot} × ${item.quantity}`).join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      For {formatDate(order.requestedFor.date)}, {SLOT_LABELS[order.requestedFor.slot].label} ·{" "}
                      <span className="tabular-nums">{formatINR(order.totalAmount)}</span>
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
