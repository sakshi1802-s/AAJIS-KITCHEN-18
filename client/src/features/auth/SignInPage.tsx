import { ChefHat, ShoppingBasket } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

interface SignInState {
  from?: string;
}

/**
 * Two clearly separate doors. Both are the same Google button — the account
 * decides the role — but a customer should never have to wonder which one is
 * theirs, and Aji should have a page that says "kitchen" on it.
 */
export function SignInPage() {
  const { user, isOwner } = useAuth();
  const location = useLocation();
  const from = (location.state as SignInState | null)?.from ?? "/";

  if (user) return <Navigate to={isOwner ? "/owner" : from} replace />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-14">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <BrandMark className="mx-auto size-12" />
          <CardTitle className="mt-3 flex items-center justify-center gap-2 font-heading text-2xl">
            <ShoppingBasket className="size-5 text-terracotta" aria-hidden="true" /> Sign in to order
          </CardTitle>
          <CardDescription>
            Browsing needs no account. Signing in lets Aji know who the order is from, and keeps your addresses for
            next time.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <GoogleSignInButton redirectTo={from} />
          <p className="text-center text-xs text-muted-foreground">
            We only ever see your name and email address — never your password.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 w-full rounded-2xl border border-dashed p-4 text-center">
        <p className="flex items-center justify-center gap-2 font-medium">
          <ChefHat className="size-4 text-maroon" aria-hidden="true" /> Are you Aji?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The kitchen dashboard — where orders are accepted and the menu is edited — has its own door.
        </p>
        <Link to="/owner-login" className="mt-2 inline-block text-sm font-medium text-terracotta underline">
          Go to the kitchen login
        </Link>
      </div>
    </div>
  );
}
