import React, { useState } from "react";
import { Modal } from "../../../shared/components/ui/Modal.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Input } from "../../../shared/components/ui/Input.jsx";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { profileService } from "../services/profile.service.js";

/**
 * Feature Component: PasswordChangeModal
 * Layer: features/profile/components/
 * Responsibility: Modal dialog allowing users to securely update their account password with validation and strength checks.
 */
export const PasswordChangeModal = ({ isOpen, onClose, onPasswordUpdated }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setIsSubmitting(false);
      onPasswordUpdated?.();
      handleClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || "Failed to change password. Please check your current password.");
    }
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
        <Input
          label="Current Password"
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••••••"
          icon={Lock}
          showPasswordToggle={true}
        />

        {/* New Password */}
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••••••"
          icon={Lock}
          showPasswordToggle={true}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          icon={Lock}
          showPasswordToggle={true}
        />

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
            className="bg-primary hover:bg-primary-hover text-white"
          >
            {isSubmitting ? "Updating..." : "Save Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordChangeModal;
