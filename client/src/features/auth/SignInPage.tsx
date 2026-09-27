import { Navigate, useLocation } from "react-router";
import { CredentialsForm } from "./CredentialsForm";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

interface SignInState {
  from?: string;
}

/**
 * The customer door: an email and password form, with Google underneath for
 * anyone who would rather not make one.
 *
 * The kitchen has its own unlisted login at /owner-login. Which account is the
 * owner is decided on the server from OWNER_EMAIL, so nothing typed here can
 * ask for the dashboard.
 */
export function SignInPage() {
  const { user, isOwner } = useAuth();
  const location = useLocation();
  const from = (location.state as SignInState | null)?.from ?? "/";

  if (user) return <Navigate to={isOwner ? "/owner" : from} replace />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8">
      <div
        className="w-full rounded-2xl border border-[#9a3412]/30 bg-[#e8d5b0] bg-repeat p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
      >
        <div className="text-center">
          <img src="/logo/aji-logo.webp" alt="" aria-hidden="true" className="mx-auto size-20 rounded-full" />
          <h1 className="mt-3 font-royal text-2xl font-bold tracking-wide text-[#4a2410]">
            Sign in to order
          </h1>
        </div>

        <CredentialsForm allowRegister redirectTo={from} idPrefix="signin" />

        <div className="my-5 flex items-center gap-3 text-xs text-[#7c2d12]">
          <span className="h-px flex-1 bg-[#9a3412]/30" />
          or
          <span className="h-px flex-1 bg-[#9a3412]/30" />
        </div>

        <div className="flex justify-center">
          <GoogleSignInButton redirectTo={from} />
        </div>
      </div>
    </div>
  );
}
