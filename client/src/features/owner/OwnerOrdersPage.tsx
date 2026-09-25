import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { OrderDTO } from "@shared/api";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/features/orders/StatusChip";
import { SLOT_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { useOwnerOrders, useOwnerStats } from "./useOwner";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3 text-center">
      <p className="font-heading text-3xl font-semibold text-maroon tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function OrderRow({ order }: { order: OrderDTO }) {
  return (
    <Link
      to={`/owner/orders/${order.id}`}
      className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{order.customer?.name ?? "Customer"}</span>
          <StatusChip status={order.status} />
        </div>
        <p className="mt-1 text-base">
          {formatDate(order.requestedFor.date)} · {SLOT_LABELS[order.requestedFor.slot].label} ·{" "}
          <span className="font-semibold tabular-nums">{formatINR(order.totalAmount)}</span>
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {order.items.map((item) => `${item.nameSnapshot} × ${item.quantity}`).join(", ")}
        </p>
      </div>
      <ChevronRight className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

export function OwnerOrdersPage() {
  const orders = useOwnerOrders();
  const stats = useOwnerStats();

  const waiting = (orders.data ?? []).filter((order) => order.status === "PLACED");
  const rest = (orders.data ?? []).filter((order) => order.status !== "PLACED");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {stats.isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : stats.isError ? null : (
          <>
            <StatCard label="Orders today" value={String(stats.data.ordersToday)} />
            <StatCard label="Waiting" value={String(stats.data.waitingForDecision)} />
            <StatCard label="This week" value={formatINR(stats.data.weekTotal)} />
          </>
        )}
      </div>

      {orders.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : orders.isError ? (
        <ErrorState title="Couldn't load your orders" error={orders.error} onRetry={() => void orders.refetch()} />
      ) : orders.data.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders will appear here as soon as they come in." />
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-royal text-xl font-bold tracking-wide text-gold">
              Needs your decision {waiting.length > 0 && <span className="text-terracotta">({waiting.length})</span>}
            </h2>
            {waiting.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-cream/25 p-6 text-center text-cream/75">
                Nothing waiting, you're all caught up.
              </p>
            ) : (
              <ul className="space-y-3">
                {waiting.map((order) => (
                  <li key={order.id}>
                    <OrderRow order={order} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 font-royal text-xl font-bold tracking-wide text-gold">Everything else</h2>
              <ul className="space-y-3">
                {rest.map((order) => (
                  <li key={order.id}>
                    <OrderRow order={order} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
