import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { UserDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { authKeys, type SessionScope } from "./authContext";

type Mode = "login" | "register";

interface CredentialsFormProps {
  /** Offer a sign-up tab. The kitchen account already exists, so its door doesn't. */
  allowRegister?: boolean;
  /** Where a customer lands afterwards; an owner always goes to the dashboard. */
  redirectTo: string;
  /** Distinguishes the field ids when two forms could share a page. */
  idPrefix?: string;
  /** Which door, and so which cookie this sign-in sets. */
  scope?: SessionScope;
}

/**
 * Email and password, used by both doors: the customer's at /signin and the
 * kitchen's at /owner-login. Which account is the owner is decided on the
 * server from OWNER_EMAIL, so nothing typed here can ask for the dashboard.
 */
export function CredentialsForm({
  allowRegister = false,
  redirectTo,
  idPrefix = "cred",
  scope = "customer",
}: CredentialsFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useMutation({
    mutationFn: (payload: { name?: string; email: string; password: string }) =>
      mode === "register"
        ? api.post<UserDTO>("/auth/register", { ...payload, scope })
        : api.post<UserDTO>("/auth/login", { email: payload.email, password: payload.password, scope }),
    onSuccess: (account) => {
      queryClient.setQueryData(authKeys.me(scope), account);
      toast.success(`Welcome, ${account.name.split(" ")[0] ?? account.name}`);
      void navigate(account.role === "owner" ? "/owner" : redirectTo, { replace: true });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "That didn't work. Try again."),
  });

  const isRegister = allowRegister && mode === "register";
  const canSubmit = email.trim() !== "" && password !== "" && (!isRegister || name.trim() !== "");

  return (
    <>
      {allowRegister && (
        // Two plain tabs, so it's obvious a new customer can make an account.
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
      )}

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit.mutate({ name: name.trim(), email: email.trim(), password });
        }}
      >
        {isRegister && (
          <div>
            <Label htmlFor={`${idPrefix}-name`} className="text-[#4a2410]">
              Your name
            </Label>
            <Input
              id={`${idPrefix}-name`}
              autoComplete="name"
              className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        )}

        <div>
          <Label htmlFor={`${idPrefix}-email`} className="text-[#4a2410]">
            Email
          </Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-password`} className="text-[#4a2410]">
            Password
          </Label>
          <Input
            id={`${idPrefix}-password`}
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="mt-1.5 h-11 border-[#9a3412]/30 bg-[#fdf6e7] text-[#3b1d0c]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegister && <p className="mt-1 text-xs text-[#6b4423]">At least 8 characters.</p>}
        </div>

        {/* An account made through Google has no password to match, and the
            server says the same thing either way so it can't be used to find
            out which emails exist. So the hint goes here, to everyone. */}
        {submit.isError && !isRegister && allowRegister && (
          <p className="text-sm text-[#7c2d12]">
            Made this account with Google? There's no password on it — use the Google button below.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit || submit.isPending}
          className="h-12 w-full rounded-full bg-[#9a3412] font-royal text-base font-bold tracking-wide text-[#f8ecd5] hover:bg-[#7c2d12]"
        >
          {submit.isPending ? "One moment" : isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>
    </>
  );
}
