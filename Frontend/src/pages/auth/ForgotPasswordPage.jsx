import React from "react";
import { Link } from "react-router-dom";
import { Headphones, ShieldCheck } from "lucide-react";
import { ForgotPasswordForm } from "../../features/auth/components/ForgotPasswordForm.jsx";

/**
 * Presentation Layer: ForgotPasswordPage
 * Layer: pages/auth/
 * Responsibility: Centered authentication card for requesting password resets, matching AgentraTeam's SaaS visual identity with logo, clear typography, and support access.
 */
export const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col justify-between items-center p-4 sm:p-6">
      {/* Top subtle decorative spacer */}
      <div className="w-full h-4" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100/90 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Project Logo & Branding */}
        <div className="mb-6">
          <Link to="/" className="inline-block group focus:outline-none">
            <img
              src="/CloudAgentra_logo.png"
              alt="AgentraTeam Logo"
              className="w-14 h-14 object-contain mx-auto mb-3.5 drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Stateful Forgot Password Form */}
        <ForgotPasswordForm />
      </div>

      {/* Footer Navigation & Support */}
      <div className="w-full max-w-md text-center py-4 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Headphones size={13} />
          <span>Having trouble?</span>
          <a
            href="mailto:support@teamsync.io"
            className="font-semibold text-slate-600 hover:text-primary hover:underline transition-colors"
          >
            Contact Support
          </a>
        </div>
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-slate-400" />
          <span>Encrypted with 256-bit SSL for account protection</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
