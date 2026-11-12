import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2, Lock } from "lucide-react";
import { Input } from "../../shared/components/ui/Input.jsx";
import { authService } from "../../features/auth/services/auth.service.js";
import { ROUTES } from "../../shared/constants/routes.js";

/**
 * Presentation Layer: ResetPasswordPage
 * Layer: pages/auth/
 * Responsibility: Allows user to reset password using token from reset link
 */
export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing from URL. Please request a new link.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to reset password. Link may be expired.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col justify-between items-center p-4 sm:p-6">
      <div className="w-full h-4" />

      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100/90 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6">
          <Link to="/" className="inline-block group focus:outline-none">
            <img
              src="/CloudAgentra_logo.png"
              alt="AgentraTeam Logo"
              className="w-14 h-14 object-contain mx-auto mb-3.5 drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Choose a strong, secure new password for your AgentraTeam account.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} className="stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Password Reset Successfully!
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Your password has been securely updated. You can now sign in with your new password.
              </p>
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all hover:scale-[1.01]"
            >
              <span>Proceed to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!token && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium">
                No reset token found in url. Please use the link sent to your email.
              </div>
            )}

            <Input
              label="New Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              showPasswordToggle={true}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              showPasswordToggle={true}
            />

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      <div className="w-full h-4" />
    </div>
  );
};

export default ResetPasswordPage;
