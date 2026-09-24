import { ShoppingBasket } from "lucide-react";
import { Navigate, useLocation } from "react-router";
import { BrandMark } from "@/components/layout/BrandMark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

interface SignInState {
  from?: string;
}

/**
 * The public sign-in: customers only.
 *
 * The kitchen dashboard has its own unlisted login (/owner-login) which is
 * deliberately not linked from anywhere on the public site. That's tidiness,
 * not security — the server checks the signed-in user's role on every
 * /api/owner request, so knowing the URL gets you nothing.
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
          <CardTitle className="mt-3 flex items-center justify-center gap-2 font-royal text-2xl">
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
    </div>
  );
}
