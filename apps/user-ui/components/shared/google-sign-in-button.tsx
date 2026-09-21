"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

// Only the slice of Google Identity Services we call.
type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode?: "popup" | "redirect";
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill";
      logo_alignment?: "left" | "center";
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

// One script tag for the whole app, however many times the modal opens.
let gsiLoader: Promise<GoogleAccountsId> | null = null;

function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (gsiLoader) return gsiLoader;

  gsiLoader = new Promise<GoogleAccountsId>((resolve, reject) => {
    const ready = () => window.google?.accounts?.id;
    const existing = ready();
    if (existing) return resolve(existing);

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = ready();
      if (api) resolve(api);
      else reject(new Error("Google Identity Services did not initialise"));
    };
    script.onerror = () => reject(new Error("Could not load Google sign-in"));
    document.head.appendChild(script);
  }).catch((error) => {
    // Let a later open of the modal retry instead of caching the failure.
    gsiLoader = null;
    throw error;
  });

  return gsiLoader;
}

export const isGoogleSignInConfigured = !!GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
  /** Called with the Google ID token; the server verifies it. */
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}

/**
 * Google's own "Continue with Google" button. Google renders it in an iframe
 * (so it can't be restyled) and returns an ID token on success — the backend
 * turns that into our normal session. Renders nothing when
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset, so the login modal degrades to the
 * OTP-only form.
 */
export function GoogleSignInButton({
  onCredential,
  disabled,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Google keeps the callback it was initialised with; route through a ref so
  // a re-render with a new closure doesn't require re-initialising.
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        const container = containerRef.current;
        if (cancelled || !container) return;

        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => {
            if (credential) onCredentialRef.current(credential);
          },
          ux_mode: "popup",
          use_fedcm_for_button: true,
        });

        container.innerHTML = "";
        google.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          // Google only accepts a pixel width, capped at 400.
          width: Math.min(Math.round(container.clientWidth) || 320, 400),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID || failed) return null;

  return (
    <div
      className={disabled ? "pointer-events-none opacity-50" : undefined}
      aria-disabled={disabled}
    >
      <div ref={containerRef} className="flex min-h-[44px] w-full justify-center" />
    </div>
  );
}
