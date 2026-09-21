import { ArrowLeft, PartyPopper } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelOrder, useOrder } from "@/features/checkout/useOrders";
import { ApiError } from "@/lib/api";
import { SLOT_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { StatusChip } from "./StatusChip";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const justPlaced = params.get("placed") === "1";
  const order = useOrder(id);
  const cancelOrder = useCancelOrder();

  if (order.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (order.isError) {
    return (
      <ErrorState
        className="py-20"
        title="Couldn't find that order"
        error={order.error}
        onRetry={() => void order.refetch()}
      />
    );
  }

  const data = order.data;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/orders">
          <ArrowLeft /> All orders
        </Link>
      </Button>

      {justPlaced && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-leaf/30 bg-leaf/10 p-4">
          <PartyPopper className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
          <div>
            <p className="font-semibold">Order sent to Aji</p>
            <p className="text-sm text-muted-foreground">
              She'll confirm it herself — you'll see the status change here.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-maroon">{data.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(data.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
          </p>
        </div>
        <StatusChip status={data.status} className="px-4 py-1.5 text-base" />
      </div>

      {data.status === "DECLINED" && data.ownerNote && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <span className="font-medium">Aji couldn't take this one:</span> {data.ownerNote}
        </p>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>What you ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.items.map((item) => (
              <li key={item.menuItemId} className="flex justify-between gap-4">
                <span>
                  {item.nameSnapshot} <span className="text-muted-foreground">× {item.quantity}</span>
                  <span className="block text-sm text-muted-foreground">
                    {formatINR(item.priceAtOrder)} {item.unitLabel}
                  </span>
                </span>
                <span className="tabular-nums">{formatINR(item.priceAtOrder * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-maroon">{formatINR(data.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">When: </span>
            {formatDate(data.requestedFor.date)}, {SLOT_LABELS[data.requestedFor.slot].label} (
            {SLOT_LABELS[data.requestedFor.slot].hint})
          </p>
          <p>
            <span className="text-muted-foreground">Where: </span>
            {[
              data.deliveryAddress.line1,
              data.deliveryAddress.line2,
              data.deliveryAddress.city,
              data.deliveryAddress.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>
            <span className="text-muted-foreground">Phone: </span>
            {data.customerPhone}
          </p>
          {data.customerNotes && (
            <p>
              <span className="text-muted-foreground">Notes: </span>
              {data.customerNotes}
            </p>
          )}
        </CardContent>
      </Card>

      {data.status === "PLACED" && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={cancelOrder.isPending}
            onClick={() => {
              cancelOrder.mutate(data.id, {
                onSuccess: () => toast.success("Order cancelled"),
                onError: (error) =>
                  toast.error(error instanceof ApiError ? error.message : "Couldn't cancel that order."),
              });
            }}
          >
            {cancelOrder.isPending ? "Cancelling…" : "Cancel this order"}
          </Button>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You can cancel while Aji hasn't decided yet.
          </p>
        </div>
      )}
    </div>
  );
}
