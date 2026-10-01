import React, { useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Feature Component: PasswordChangeModal
 * Layer: features/profile/components/
 * Responsibility: Modal dialog allowing users to securely update their account password with validation and strength checks.
 */
export const PasswordChangeModal = ({ isOpen, onClose, onPasswordUpdated }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isMatching = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
    if (!isMinLength || !hasNumberOrSymbol) {
      setError("New password does not meet security criteria");
      return;
    }
    if (!isMatching) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    onPasswordUpdated?.();
    handleClose();
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Password"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={15} />
            </div>
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            New Password
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={15} />
            </div>
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
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
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] text-xs font-semibold text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>
        </div>

        {/* Security Checklist */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] font-medium text-slate-500">
          <div
            className={`flex items-center gap-2 ${isMinLength ? "text-emerald-600 font-semibold" : ""}`}
          >
            <CheckCircle2
              size={13}
              className={isMinLength ? "text-emerald-500" : "text-slate-300"}
            />
            <span>At least 8 characters in length</span>
          </div>
          <div
            className={`flex items-center gap-2 ${hasNumberOrSymbol ? "text-emerald-600 font-semibold" : ""}`}
          >
            <CheckCircle2
              size={13}
              className={
                hasNumberOrSymbol ? "text-emerald-500" : "text-slate-300"
              }
            />
            <span>Contains numbers or special characters</span>
          </div>
          <div
            className={`flex items-center gap-2 ${isMatching ? "text-emerald-600 font-semibold" : ""}`}
          >
            <CheckCircle2
              size={13}
              className={isMatching ? "text-emerald-500" : "text-slate-300"}
            />
            <span>Passwords match</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || !isMinLength || !hasNumberOrSymbol || !isMatching
            }
            className="bg-[#4361EE] hover:bg-[#3451DE] text-white"
          >
            {isSubmitting ? "Updating..." : "Save Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordChangeModal;
