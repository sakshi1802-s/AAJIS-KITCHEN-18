import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { loadGoogleIdentity, type GoogleCredentialResponse } from "./googleIdentity";
import { useAuth } from "./useAuth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const BUTTON_WIDTH = 280;

/** The Google "G", so our own button still looks like Google's. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84a10.1 10.1 0 0 1-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46z"
      />
      <path fill="#FBBC05" d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A22 22 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

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
          width: BUTTON_WIDTH,
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
    <div className="flex flex-col items-center gap-2">
      {/*
        Google renders its own button, and once you have signed in with it
        before it turns into a card with your name and address on it. That is
        Google's doing and there is no flag to turn it off, so the real button
        sits invisible on top of a plain one of ours: the click still goes to
        Google, the page just doesn't display anyone's account.
      */}
      <div className="relative" style={{ width: BUTTON_WIDTH, height: 44 }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-full border border-[#8a5a2b]/40 bg-[#fdf6e6] font-medium text-[#3b1d0c] shadow-sm"
        >
          <GoogleMark />
          Continue with Google
        </div>

        <div ref={containerRef} className="absolute inset-0 opacity-0" />
      </div>

      {busy && <p className="text-sm text-muted-foreground">Signing you in…</p>}
    </div>
  );
}
