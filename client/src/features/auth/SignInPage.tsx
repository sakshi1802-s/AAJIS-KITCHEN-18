import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import type { UserDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { authKeys } from "./authContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";

interface SignInState {
  from?: string;
}

type Mode = "login" | "register";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const from = (location.state as SignInState | null)?.from ?? "/";

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useMutation({
    mutationFn: (payload: { name?: string; email: string; password: string }) =>
      mode === "register"
        ? api.post<UserDTO>("/auth/register", payload)
        : api.post<UserDTO>("/auth/login", { email: payload.email, password: payload.password }),
    onSuccess: (account) => {
      queryClient.setQueryData(authKeys.me, account);
      toast.success(`Welcome, ${account.name.split(" ")[0] ?? account.name}`);
      void navigate(account.role === "owner" ? "/owner" : from, { replace: true });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "That didn't work. Try again."),
  });

  if (user) return <Navigate to={isOwner ? "/owner" : from} replace />;

  const isRegister = mode === "register";
  const canSubmit = email.trim() !== "" && password !== "" && (!isRegister || name.trim() !== "");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8">
      <div
        className="w-full rounded-2xl border border-[#9a3412]/30 bg-[#e8d5b0] bg-repeat p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: "url('/textures/parchment-tile.png')", backgroundSize: "400px auto" }}
      >
        <div className="text-center">
          <img src="/logo/aji-logo.webp" alt="" aria-hidden="true" className="mx-auto size-20 rounded-full" />
          <h1 className="mt-3 font-royal text-2xl font-bold tracking-wide text-[#4a2410]">
            {isRegister ? "Create your account" : "Sign in to order"}
          </h1>
        </div>

        {/* Two plain tabs, so it's obvious a new customer can make an account. */}
        <div className="mt-5 grid grid-cols-2 rounded-full border border-[#9a3412]/30 p-1">
          {(["login", "register"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "rounded-full py-2 font-royal text-sm font-bold tracking-wide transition-colors",
                mode === option ? "bg-[#9a3412] text-[#f8ecd5]" : "text-[#7c2d12] hover:bg-[#9a3412]/10",
              )}
            >
              {option === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate({ name: name.trim(), email: email.trim(), password });
          }}
        >
          {isRegister && (
            <div>
              <Label htmlFor="signin-name" className="text-[#4a2410]">
                Your name
              </Label>
              <Input
                id="signin-name"
                autoComplete="name"
                className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="signin-email" className="text-[#4a2410]">
              Email
            </Label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="signin-password" className="text-[#4a2410]">
              Password
            </Label>
            <Input
              id="signin-password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isRegister && <p className="mt-1 text-xs text-[#6b4423]">At least 8 characters.</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit || submit.isPending}
            className="h-12 w-full rounded-full bg-[#9a3412] font-royal text-base font-bold tracking-wide text-[#f8ecd5] hover:bg-[#7c2d12]"
          >
            {submit.isPending ? "One moment" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>

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
