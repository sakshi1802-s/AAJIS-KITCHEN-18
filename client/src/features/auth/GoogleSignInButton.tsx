import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { loadGoogleIdentity, type GoogleCredentialResponse } from "./googleIdentity";
import { useAuth } from "./useAuth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

interface GoogleSignInButtonProps {
  /** Where to go after signing in; owners always land on their dashboard. */
  redirectTo?: string;
  onSignedIn?: () => void;
}

export function GoogleSignInButton({ redirectTo = "/", onSignedIn }: GoogleSignInButtonProps) {
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
        google.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 280,
          logo_alignment: "center",
        });
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      {busy && <p className="text-sm text-muted-foreground">Signing you in…</p>}
    </div>
  );
}
