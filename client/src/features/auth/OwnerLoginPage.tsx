import { ChefHat } from "lucide-react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CredentialsForm } from "./CredentialsForm";
import { useAuth } from "./useAuth";

/**
 * Aaji's door, and it asks for her email and password rather than reaching
 * for whatever account the browser happens to be holding. If someone is
 * already signed in as a customer it says so and offers to sign them out,
 * instead of quietly using that session and refusing the dashboard.
 */
export function OwnerLoginPage() {
  const { user, isOwner, signOut } = useAuth();

  if (isOwner) return <Navigate to="/owner" replace />;

  const signedInAsCustomer = Boolean(user);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8">
      <div
        className="w-full rounded-2xl border border-[#9a3412]/30 bg-[#e8d5b0] bg-repeat p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
      >
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#9a3412]/15 text-[#7c2d12]">
            <ChefHat className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-3 font-royal text-2xl font-bold tracking-wide text-[#4a2410]">Kitchen login</h1>
          <p className="mt-1.5 text-sm text-[#6b4423]">
            For Aaji. Today's orders, accepting and declining them, and the menu.
          </p>
        </div>

        {signedInAsCustomer ? (
          <div className="mt-6 space-y-4 text-center">
            <div role="alert" className="rounded-xl border border-[#9a3412]/40 bg-[#fdf6e7] p-4 text-sm">
              <p className="font-semibold text-[#7c2d12]">You're signed in as {user?.email}</p>
              <p className="mt-1 text-[#6b4423]">
                That's a customer account, which is fine for ordering. Sign out to use the kitchen's.
              </p>
            </div>

            <Button
              size="lg"
              className="h-12 w-full rounded-full bg-[#9a3412] font-royal text-base font-bold tracking-wide text-[#f8ecd5] hover:bg-[#7c2d12]"
              onClick={() => {
                void signOut().then(() => toast.success("Signed out. The kitchen login is ready."));
              }}
            >
              Sign out and log in as the kitchen
            </Button>

            <p className="text-xs text-[#6b4423]">
              Carrying on as a customer?{" "}
              <Link to="/menu" className="underline">
                Browse the menu
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <CredentialsForm redirectTo="/owner" idPrefix="kitchen" />

            <p className="mt-5 text-center text-xs text-[#6b4423]">
              Ordering food instead?{" "}
              <Link to="/signin" className="underline">
                Sign in over here
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
