import { Link, Navigate } from "react-router";
import { CredentialsForm } from "./CredentialsForm";
import { useAuth } from "./useAuth";

/**
 * Aaji's door: her email and her password, and nothing else. No Google, so it
 * never reaches for whatever account the browser happens to be holding — that
 * belongs on the customer's door. A password is put on the account with
 * `npm --prefix server run set-owner-password`.
 *
 * Signing in here replaces whatever session is already open, so a customer who
 * wanders in just types the kitchen's details; there is nothing to sign out of
 * first.
 */
export function OwnerLoginPage() {
  const { user, isOwner } = useAuth();

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

        {user && (
          <p className="mt-5 rounded-xl border border-[#9a3412]/30 bg-[#fdf6e7] px-4 py-3 text-center text-sm text-[#6b4423]">
            Signed in as <span className="font-semibold text-[#7c2d12]">{user.email}</span>. Enter the kitchen's
            details below to switch.
          </p>
        )}

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
