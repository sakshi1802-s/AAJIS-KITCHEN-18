import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { SLOTS, type CartConflictDetails, type Slot } from "@shared/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressForm } from "@/features/profile/AddressForm";
import { useUpdateProfile } from "@/features/profile/useProfile";
import { useAuth } from "@/features/auth/useAuth";
import { useCart } from "@/features/cart/cartContext";
import { ApiError } from "@/lib/api";
import { SLOT_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ConflictDialog } from "./ConflictDialog";
import { usePlaceOrder } from "./useOrders";

/** Today and 60 days out, as IST calendar dates — the server checks this too. */
const istToday = () => new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
const istMax = () => new Date(Date.now() + 330 * 60 * 1000 + 60 * 864e5).toISOString().slice(0, 10);

export function CheckoutPage() {
  const { user } = useAuth();
  const { lines, total, clear } = useCart();
  const placeOrder = usePlaceOrder();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [addressId, setAddressId] = useState(() => user?.addresses.find((a) => a.isDefault)?.id ?? "");
  const [addingAddress, setAddingAddress] = useState(false);
  const [date, setDate] = useState(istToday);
  const [slot, setSlot] = useState<Slot>("evening");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [conflicts, setConflicts] = useState<CartConflictDetails["conflicts"] | null>(null);

  if (lines.length === 0 && !placeOrder.isSuccess) return <Navigate to="/cart" replace />;
  if (!user) return null;

  const address = user.addresses.find((a) => a.id === addressId);
  const phoneLooksValid = /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(phone.trim());
  const canPlace = Boolean(address) && phoneLooksValid && Boolean(date) && !placeOrder.isPending;

  const submit = async () => {
    if (!address) {
      toast.error("Pick a delivery address first.");
      return;
    }
    try {
      // Keep the phone for next time, but never block the order on it.
      if (phone.trim() !== (user.phone ?? "")) {
        await updateProfile.mutateAsync({ phone: phone.trim() }).catch(() => undefined);
      }

      const order = await placeOrder.mutateAsync({
        items: lines.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          expectedPrice: line.price,
        })),
        requestedFor: { date, slot },
        deliveryAddress: {
          label: address.label,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          pincode: address.pincode,
        },
        customerPhone: phone.trim(),
        customerNotes: notes.trim(),
      });

      clear();
      void navigate(`/orders/${order.id}?placed=1`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === "CART_CONFLICT") {
        setConflicts((error.details as CartConflictDetails).conflicts);
        return;
      }
      toast.error(error instanceof ApiError ? error.message : "Couldn't place the order. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">Checkout</h1>

      <div className="mt-6 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Where should it go?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.addresses.length > 0 && (
              <ul className="space-y-2">
                {user.addresses.map((option) => (
                  <li key={option.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                        option.id === addressId ? "border-primary bg-accent/50" : "hover:bg-muted/50",
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-[var(--terracotta)]"
                        checked={option.id === addressId}
                        onChange={() => setAddressId(option.id)}
                      />
                      <span className="min-w-0">
                        <span className="font-medium">
                          {option.label}
                          {option.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                              Default
                            </Badge>
                          )}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {[option.line1, option.line2, option.city, option.pincode].filter(Boolean).join(", ")}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {addingAddress || user.addresses.length === 0 ? (
              <div className="rounded-xl border p-4">
                <AddressForm
                  makeDefault={user.addresses.length === 0}
                  onAdded={(id) => {
                    setAddressId(id);
                    setAddingAddress(false);
                  }}
                  onCancel={user.addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                />
              </div>
            ) : (
              <Button variant="outline" onClick={() => setAddingAddress(true)}>
                Add another address
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>When do you need it?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requested-date">Date</Label>
              <Input
                id="requested-date"
                type="date"
                className="mt-1.5 h-11 w-full sm:w-56"
                value={date}
                min={istToday()}
                max={istMax()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Time of day</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SLOTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={slot === option}
                    onClick={() => setSlot(option)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      slot === option ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="block font-medium">{SLOT_LABELS[option].label}</span>
                    <span className={cn("block text-xs", slot === option ? "opacity-80" : "text-muted-foreground")}>
                      {SLOT_LABELS[option].hint}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anything else?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="checkout-phone">Mobile number</Label>
              <Input
                id="checkout-phone"
                className="mt-1.5 h-11 w-full sm:w-56"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                aria-invalid={phone.length > 0 && !phoneLooksValid}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phone.length > 0 && !phoneLooksValid && (
                <p className="mt-1 text-sm text-destructive">Enter a 10-digit Indian mobile number</p>
              )}
            </div>
            <div>
              <Label htmlFor="checkout-notes">Notes for Aaji (optional)</Label>
              <textarea
                id="checkout-notes"
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="kam tikhat, no coriander, ring the bell twice…"
                className="mt-1.5 w-full rounded-xl border bg-background p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your order</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.menuItemId} className="flex justify-between gap-4 text-sm">
                  <span>
                    {line.name} <span className="text-muted-foreground">× {line.quantity}</span>
                  </span>
                  <span className="tabular-nums">{formatINR(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg">
              <span className="font-medium">Total</span>
              <span className="font-heading text-2xl font-semibold text-maroon tabular-nums">{formatINR(total)}</span>
            </div>
            <Button
              size="lg"
              className="mt-4 h-12 w-full rounded-full text-base"
              disabled={!canPlace}
              onClick={() => void submit()}
            >
              {placeOrder.isPending ? "Placing your order…" : "Place order"}
            </Button>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You'll pay Aaji directly. <Link to="/cart" className="underline">Back to cart</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {conflicts && <ConflictDialog conflicts={conflicts} onClose={() => setConflicts(null)} />}
    </div>
  );
}
