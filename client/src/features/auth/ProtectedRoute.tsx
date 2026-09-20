import { Navigate, Outlet, useLocation } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "./useAuth";

/**
 * Guards customer pages, and — with ownerOnly — Aji's dashboard.
 * While the session is still being checked we show a placeholder rather than
 * bouncing a signed-in user to the sign-in page on every hard refresh.
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
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }

  if (ownerOnly && !isOwner) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
