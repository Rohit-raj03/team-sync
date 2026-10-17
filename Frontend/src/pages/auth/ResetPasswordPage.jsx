import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
              src="/logo.png"
              alt="Team Sync Logo"
              className="w-14 h-14 object-contain mx-auto mb-3.5 drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
            Choose a strong, secure new password for your Team Sync account.
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
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all hover:scale-[1.01]"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#4361EE]"
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

