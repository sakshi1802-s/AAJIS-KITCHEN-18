import { ShieldX } from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "./useAuth";

/**
 * Guards customer pages, and — with ownerOnly — the kitchen dashboard.
 *
 * This is only the front door. Every /api/owner route checks the signed-in
 * user's role on the server, so a customer who types the dashboard URL gets
 * 403s from the API regardless of what the client renders.
 */
export function ProtectedRoute({ ownerOnly = false }: { ownerOnly?: boolean }) {
  const { user, isLoading, isOwner } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    // Signed out: the owner area sends people to its own unlisted login.
    const to = ownerOnly ? "/owner-login" : "/signin";
    return <Navigate to={to} replace state={{ from: location.pathname + location.search }} />;
  }

  // Signed in, but not the kitchen account: say so plainly rather than
  // bouncing them somewhere confusing.
  if (ownerOnly && !isOwner) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center" role="alert">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-royal text-2xl font-bold text-gold">Not your kitchen</h1>
        <p className="mt-2 text-cream/80">
          This area belongs to Aaji. Your account, {user.email}, is a customer account, which is all you need to
          order.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/menu">Browse the menu</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/orders">My orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
