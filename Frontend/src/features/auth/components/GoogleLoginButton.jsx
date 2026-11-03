import React, { useEffect, useRef, useState } from "react";
import { env } from "../../../config/env.js";

/**
 * Feature Component: GoogleLoginButton
 * Responsibility: Renders official Google Identity Services (GIS) Sign-In button
 * without any external npm packages or peer-dependency conflicts.
 */
export const GoogleLoginButton = ({
  onSuccess,
  onError,
  disabled = false,
  text = "continue_with",
}) => {
  const buttonRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let checkInterval = null;

    const initializeGoogleSignIn = () => {
      if (typeof window === "undefined" || !window.google?.accounts?.id) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) {
              onSuccess?.(response.credential);
            } else {
              onError?.(new Error("No credential returned from Google"));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          buttonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: "360",
            text, // "signin_with" | "signup_with" | "continue_with"
            shape: "rectangular",
            logo_alignment: "center",
          });
        }

        setIsReady(true);
        return true;
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
        onError?.(err);
        return false;
      }
    };

    if (!initializeGoogleSignIn()) {
      // Poll until Google Identity script is loaded
      checkInterval = setInterval(() => {
        if (initializeGoogleSignIn()) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onSuccess, onError, text]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        ref={buttonRef}
        className={`w-full flex justify-center min-h-11 transition-opacity duration-200 ${
          disabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      />
      {!isReady && (
        <div className="w-full max-w-90 h-11 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium">
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
