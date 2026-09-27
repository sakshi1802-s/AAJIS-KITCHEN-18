/**
 * A thin wrapper over Google Identity Services.
 *
 * GIS renders its own button, runs the account chooser, and hands us back an
 * ID token. That token is the only thing we send to our server, which verifies
 * it and sets the session cookie. No client secret, no redirect, no password.
 */

export interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  /** "icon" is the mark on its own, with no room for an account name. */
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with";
  width?: number;
  logo_alignment?: "left" | "center";
}

interface GoogleIdentityApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    ux_mode?: "popup" | "redirect";
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

let loader: Promise<GoogleIdentityApi> | undefined;

/** Loads the GIS script once per page, no matter how many buttons ask for it. */
export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  loader ??= new Promise((resolve, reject) => {
    if (window.google?.accounts.id) {
      resolve(window.google.accounts.id);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement("script");
    const onLoad = () => {
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else reject(new Error("Google Identity Services loaded without an accounts API"));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Couldn't reach Google to load sign-in")), {
      once: true,
    });

    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return loader;
}

/**
 * After a sign-out, tell Google not to auto-select the same account again, so
 * the next sign-in shows the chooser rather than going straight back in.
 */
export function forgetGoogleSelection(): void {
  try {
    window.google?.accounts.id.disableAutoSelect();
  } catch {
    // GIS not loaded yet — nothing to forget.
  }
}
