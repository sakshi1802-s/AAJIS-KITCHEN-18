import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/api";
import { AddressForm } from "./AddressForm";
import { useRemoveAddress, useUpdateProfile } from "./useProfile";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?91[\s-]?)?[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const removeAddress = useRemoveAddress();
  const [addingAddress, setAddingAddress] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  if (!user) return null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save your details.");
    }
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:py-10">
      <header>
        <h1 className="font-royal text-3xl font-bold tracking-wide text-gold sm:text-4xl">Your details</h1>
        <p className="mt-2 text-cream/80">
          Signed in as {user.email}. Aaji uses your phone number to reach you about an order.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Name and phone</CardTitle>
          <CardDescription>These go on every order you place.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  className="mt-1.5 h-11"
                  autoComplete="name"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="profile-phone">Mobile number</Label>
                <Input
                  id="profile-phone"
                  className="mt-1.5 h-11"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery addresses</CardTitle>
          <CardDescription>Pick one of these at checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.addresses.length === 0 && !addingAddress && (
            <p className="text-muted-foreground">No addresses saved yet.</p>
          )}

          <ul className="space-y-3">
            {user.addresses.map((address) => (
              <li key={address.id} className="flex items-start gap-3 rounded-xl border bg-background p-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {address.label}
                    {address.isDefault && (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[address.line1, address.line2, address.city, address.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${address.label}`}
                  disabled={removeAddress.isPending}
                  onClick={() => {
                    removeAddress.mutate(address.id, {
                      onSuccess: () => toast.success("Address removed"),
                      onError: (error) =>
                        toast.error(error instanceof ApiError ? error.message : "Couldn't remove that address."),
                    });
                  }}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>

          {addingAddress ? (
            <div className="rounded-xl border bg-background p-4">
              <AddressForm onAdded={() => setAddingAddress(false)} onCancel={() => setAddingAddress(false)} />
            </div>
          ) : (
            <Button variant="outline" size="lg" onClick={() => setAddingAddress(true)}>
              <Plus /> Add an address
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
