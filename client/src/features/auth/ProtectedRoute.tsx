import { Navigate, Outlet, useLocation } from "react-router";
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

  // Signed in, but not the kitchen account. Send them to the kitchen's own
  // door rather than a dead end: opening it ends the customer session and
  // asks for Aaji's, which is the only thing they could have wanted here.
  if (ownerOnly && !isOwner) {
    return <Navigate to="/owner-login" replace />;
  }

  return <Outlet />;
}
