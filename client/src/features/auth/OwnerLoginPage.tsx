import { useEffect, useRef } from "react";
import { Link, Navigate } from "react-router";
import { CredentialsForm } from "./CredentialsForm";
import { useAuth } from "./useAuth";

/**
 * Aaji's door: her email and her password, and nothing else. No Google, so it
 * never reaches for whatever account the browser happens to be holding — that
 * belongs on the customer's door. A password is put on the account with
 * `npm --prefix server run set-owner-password`.
 *
 * Opening this page ends any customer session first, so the kitchen always
 * starts from a signed-out page rather than from whoever used the browser
 * last.
 */
export function OwnerLoginPage() {
  const { user, isOwner, signOut } = useAuth();

  // Once per visit: an owner who is already signed in is sent straight
  // through, anyone else is signed out so the form starts clean.
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current || !user || isOwner) return;
    handled.current = true;
    void signOut();
  }, [user, isOwner, signOut]);

  if (isOwner) return <Navigate to="/owner" replace />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8">
      <div
        className="w-full rounded-2xl border border-[#9a3412]/30 bg-[#e8d5b0] bg-repeat p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
      >
        <div className="text-center">
          <img src="/logo/aji-logo.webp" alt="" aria-hidden="true" className="mx-auto size-20 rounded-full" />
          <h1 className="mt-3 font-royal text-2xl font-bold tracking-wide text-[#4a2410]">Kitchen login</h1>
          <p className="mt-1.5 text-sm text-[#6b4423]">
            For Aaji. Today's orders, the reviews waiting to go up, and the menu.
          </p>
        </div>

        <CredentialsForm redirectTo="/owner" idPrefix="kitchen" />

        <p className="mt-5 text-center text-xs text-[#6b4423]">
          Ordering food instead?{" "}
          <Link to="/signin" className="underline">
            Sign in over here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
