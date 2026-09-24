import { ArrowLeft, Check, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/features/checkout/useOrders";
import { StatusChip } from "@/features/orders/StatusChip";
import { ApiError } from "@/lib/api";
import { SLOT_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { useDecideOrder } from "./useOwner";

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

export function OwnerOrderDetailPage() {
  const { id = "" } = useParams();
  const order = useOrder(id);
  const decide = useDecideOrder(id);
  const [decliningOpen, setDecliningOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (order.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }
  if (order.isError) {
    return <ErrorState title="Couldn't load that order" error={order.error} onRetry={() => void order.refetch()} />;
  }

  const data = order.data;
  const failed = (error: unknown) =>
    toast.error(error instanceof ApiError ? error.message : "That didn't work. Please try again.");

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="lg" className="-ml-2">
        <Link to="/owner">
          <ArrowLeft /> All orders
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-royal text-2xl font-bold tracking-wide text-gold sm:text-3xl">{data.customer?.name ?? "Customer"}</h1>
          <p className="font-mono text-sm text-cream/70">{data.orderNumber}</p>
        </div>
        <StatusChip status={data.status} className="px-4 py-1.5 text-base" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">When and where</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-lg">
          <p>
            {formatDate(data.requestedFor.date)}
            <span className="text-muted-foreground">
              {" "}
              · {SLOT_LABELS[data.requestedFor.slot].label} ({SLOT_LABELS[data.requestedFor.slot].hint})
            </span>
          </p>
          <p className="text-base">
            {[data.deliveryAddress.line1, data.deliveryAddress.line2, data.deliveryAddress.city, data.deliveryAddress.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
          <Button asChild variant="outline" size="lg" className="mt-1 h-12 w-full text-base sm:w-auto">
            <a href={`tel:+91${data.customerPhone}`}>
              <Phone /> Call {data.customerPhone}
            </a>
          </Button>
          {data.customerNotes && (
            <p className="rounded-xl bg-accent/60 p-3 text-base">
              <span className="font-medium">Note: </span>
              {data.customerNotes}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">What they want</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-lg">
            {data.items.map((item) => (
              <li key={item.menuItemId} className="flex justify-between gap-4">
                <span>
                  <span className="font-semibold">{item.quantity}</span> × {item.nameSnapshot}
                  <span className="block text-sm text-muted-foreground">{item.unitLabel}</span>
                </span>
                <span className="tabular-nums">{formatINR(item.priceAtOrder * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-xl font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-maroon">{formatINR(data.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {data.status === "PLACED" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            className="h-16 rounded-2xl text-xl"
            disabled={decide.isPending}
            onClick={() =>
              decide.mutate(
                { decision: "ACCEPTED" },
                { onSuccess: () => toast.success("Order accepted"), onError: failed },
              )
            }
          >
            <Check className="size-6" /> Accept
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 rounded-2xl border-destructive/40 text-xl text-destructive"
            disabled={decide.isPending}
            onClick={() => setDecliningOpen(true)}
          >
            <X className="size-6" /> Can't do it
          </Button>
        </div>
      ) : (
        <p className="rounded-2xl border bg-muted/40 p-4 text-center text-muted-foreground">
          {data.status === "ACCEPTED"
            ? "You've accepted this order — the customer has been told."
            : data.status === "DECLINED"
              ? `You declined this order: ${data.ownerNote ?? ""}`
              : "The customer cancelled this order."}
        </p>
      )}

      <Dialog open={decliningOpen} onOpenChange={setDecliningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell them why</DialogTitle>
            <DialogDescription>
              The customer sees this, so a short line is enough — they'll know you saw the order.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="decline-reason">Reason</Label>
            <textarea
              id="decline-reason"
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="I'm at a wedding that day / too many orders already"
              className="mt-1.5 w-full rounded-xl border bg-background p-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="lg" onClick={() => setDecliningOpen(false)}>
              Back
            </Button>
            <Button
              size="lg"
              disabled={reason.trim().length === 0 || decide.isPending}
              onClick={() =>
                decide.mutate(
                  { decision: "DECLINED", reason: reason.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Order declined");
                      setDecliningOpen(false);
                      setReason("");
                    },
                    onError: failed,
                  },
                )
              }
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
