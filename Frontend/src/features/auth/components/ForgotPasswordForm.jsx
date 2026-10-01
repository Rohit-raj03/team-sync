import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  HelpCircle,
} from "lucide-react";
import { authService } from "../services/auth.service.js";
import { ROUTES } from "../../../shared/constants/routes.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Feature Component: ForgotPasswordForm
 * Layer: features/auth/components/
 * Responsibility: Complete stateful form handling password reset requests, client validation, loading spinner, security-safe success response, and error retry.
 */
export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setValidationError("Please enter your email address.");
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setValidationError(
        "Please enter a valid email address (e.g. name@company.com).",
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await authService.requestPasswordReset(email.trim());
      setStatus("success");
      setResendTimer(60); // 60s cooldown
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message ||
          "Unable to connect to the reset service. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setStatus("loading");
    try {
      await authService.requestPasswordReset(email.trim());
      setStatus("success");
      setResendTimer(60);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message ||
          "Failed to resend reset link. Please check your network and retry.",
      );
    }
  };

  const handleResetToIdle = () => {
    setStatus("idle");
    setErrorMessage("");
    setValidationError("");
  };

  // SUCCESS STATE VIEW
  if (status === "success") {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Green Badge */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={32} className="stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Check your email
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-slate-800 break-all">
              {email}
            </span>
            .
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            If you don't see the email within a couple of minutes, please check
            your spam folder.
          </p>
        </div>

        {/* Resend Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs">
          {resendTimer > 0 ? (
            <p className="text-slate-500 font-medium">
              Resend available in{" "}
              <span className="text-[#4361EE] font-bold">{resendTimer}s</span>
            </p>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-slate-600">
              <span>Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[#4361EE] hover:text-[#3451DE] hover:underline transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>Click to resend</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            to={ROUTES.LOGIN}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-98"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>

          <button
            type="button"
            onClick={handleResetToIdle}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Try another email address
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT / ERROR / LOADING FORM VIEW
  return (
    <form onSubmit={handleSend} className="space-y-5" noValidate>
      {/* Error state alert banner with retry */}
      {status === "error" && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-medium space-y-2 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-snug flex-1">{errorMessage}</p>
          </div>
          <div className="pl-6">
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] transition-colors"
            >
              <RefreshCw size={11} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="forgot-email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Email Address <span className="text-rose-500">*</span>
        </label>

        <div className="relative">
          <Mail
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              validationError ? "text-rose-400" : "text-slate-400"
            }`}
          />
          <input
            id="forgot-email"
            type="email"
            autoFocus
            disabled={status === "loading"}
            placeholder="e.g. alex@teamsync.io"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError("");
              if (status === "error") setStatus("idle");
            }}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
              validationError
                ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#4361EE] focus:border-transparent"
            } placeholder-slate-400 shadow-xs disabled:opacity-60 disabled:bg-slate-50`}
          />
        </div>

        {validationError && (
          <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
            <AlertCircle size={13} />
            <span>{validationError}</span>
          </p>
        )}
      </div>

      {/* Primary Action Button: Send Reset Link */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-60 disabled:pointer-events-none"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Sending Reset Link...</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>Send Reset Link</span>
          </>
        )}
      </button>

      {/* Secondary Action: Back to Login */}
      <div className="pt-2 flex items-center justify-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#4361EE] transition-colors py-1 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to Login</span>
        </Link>
      </div>
    </form>
  );
};
