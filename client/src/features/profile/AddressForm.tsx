import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { addressFormSchema, type AddressFormValues } from "./addressSchema";
import { useAddAddress } from "./useProfile";

interface AddressFormProps {
  onAdded?: (addressId: string) => void;
  onCancel?: () => void;
  makeDefault?: boolean;
}

export function AddressForm({ onAdded, onCancel, makeDefault = false }: AddressFormProps) {
  const addAddress = useAddAddress();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { label: "Home", line1: "", line2: "", city: "", pincode: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await addAddress.mutateAsync({ ...values, isDefault: makeDefault });
      const newest = user.addresses.at(-1);
      toast.success("Address saved");
      form.reset();
      if (newest) onAdded?.(newest.id);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save that address.");
    }
  });

  const fields = [
    { name: "label", label: "Label", placeholder: "Home, Aai's place, Office", autoComplete: "off" },
    { name: "line1", label: "Flat / building", placeholder: "Flat 3, Shanti Nivas", autoComplete: "address-line1" },
    { name: "line2", label: "Area / landmark (optional)", placeholder: "Off FC Road", autoComplete: "address-line2" },
    { name: "city", label: "City", placeholder: "Pune", autoComplete: "address-level2" },
    { name: "pincode", label: "Pincode", placeholder: "411004", autoComplete: "postal-code" },
  ] as const;

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const error = form.formState.errors[field.name];
          return (
            <div key={field.name} className={field.name === "line1" || field.name === "line2" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`address-${field.name}`}>{field.label}</Label>
              <Input
                id={`address-${field.name}`}
                className="mt-1.5 h-11"
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                inputMode={field.name === "pincode" ? "numeric" : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `address-${field.name}-error` : undefined}
                {...form.register(field.name)}
              />
              {error && (
                <p id={`address-${field.name}-error`} className="mt-1 text-sm text-destructive">
                  {error.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={addAddress.isPending}>
          {addAddress.isPending ? "Saving…" : "Save address"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
