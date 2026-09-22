import { ChefHat } from "lucide-react";
import { Link, Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

/**
 * Aji's door. Same Google sign-in, different wording — and if the account that
 * signs in here isn't the kitchen's, it says so plainly instead of dropping
 * them on the home page wondering what happened.
 */
export function OwnerLoginPage() {
  const { user, isOwner } = useAuth();

  if (isOwner) return <Navigate to="/owner" replace />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <Card className="w-full border-maroon/30">
        <CardHeader className="items-center text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-maroon/10 text-maroon">
            <ChefHat className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="mt-3 font-heading text-2xl">Kitchen login</CardTitle>
          <CardDescription>
            For Aji. Sign in with the kitchen's Google account to see today's orders, accept or decline them, and edit
            the menu.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {user && !isOwner ? (
            <div role="alert" className="w-full rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">
                {user.email} isn't the kitchen account.
              </p>
              <p className="mt-1 text-muted-foreground">
                You're signed in as a customer, which is fine for ordering — the dashboard just isn't yours. Sign out
                and use Aji's Google account, or carry on ordering.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/menu">Browse the menu</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/orders">My orders</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <GoogleSignInButton redirectTo="/owner" />
              <p className="text-center text-xs text-muted-foreground">
                Ordering food instead?{" "}
                <Link to="/signin" className="underline">
                  Sign in over here
                </Link>
                .
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
