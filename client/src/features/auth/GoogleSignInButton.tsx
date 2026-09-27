import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { loadGoogleIdentity, type GoogleCredentialResponse } from "./googleIdentity";
import { useAuth } from "./useAuth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

interface GoogleSignInButtonProps {
  /**
   * "icon" is the Google mark on its own. "wide" is Google's full button,
   * which turns into a card with the account's name and photo once you have
   * signed in with it before — right for the kitchen's own door, wrong for a
   * public one.
   */
  variant?: "icon" | "wide";
  /** Where to go after signing in; owners always land on their dashboard. */
  redirectTo?: string;
  onSignedIn?: () => void;
}

export function GoogleSignInButton({ redirectTo = "/", onSignedIn, variant = "icon" }: GoogleSignInButtonProps) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCredential = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      toast.error("Google didn't return a sign-in token. Please try again.");
      return;
    }
    setBusy(true);
    try {
      const user = await signIn(response.credential);
      toast.success(`Welcome, ${user.name.split(" ")[0] ?? user.name}!`);
      onSignedIn?.();
      void navigate(user.role === "owner" ? "/owner" : redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Google's button is rendered once; this ref keeps its callback current
  // without tearing the button down on every render.
  const handlerRef = useRef(handleCredential);
  useEffect(() => {
    handlerRef.current = handleCredential;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        google.initialize({
          client_id: CLIENT_ID,
          callback: (response) => void handlerRef.current(response),
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
        });
        google.renderButton(
          containerRef.current,
          variant === "wide"
            ? { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 280 }
            : { type: "icon", theme: "outline", size: "large", shape: "circle" },
        );
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (!CLIENT_ID) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Google sign-in isn't configured. Add <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to{" "}
        <code className="font-mono">client/.env</code> and restart the dev server.
      </p>
    );
  }

  if (scriptFailed) {
    return (
      <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Couldn't reach Google to load the sign-in button. Check your connection and refresh.
      </p>
    );
  }

  return (
    <div className="flex min-h-11 flex-col items-center gap-2">
      <div ref={containerRef} />
      {variant === "icon" && <p className="text-xs text-[#6b4423]">Continue with Google</p>}
      {busy && <p className="text-sm text-muted-foreground">Signing you in…</p>}
    </div>
  );
}
