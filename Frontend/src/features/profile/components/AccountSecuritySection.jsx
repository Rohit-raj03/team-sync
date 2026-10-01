import React, { useState } from "react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { PasswordChangeModal } from "./PasswordChangeModal.jsx";
import {
  CheckCircle2,
  Shield,
  KeyRound,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

/**
 * Feature Component: AccountSecuritySection
 * Layer: features/profile/components/
 * Responsibility: Manages Account & Security information including email verification status, password change modal, and two-factor authentication toggle.
 */
export const AccountSecuritySection = ({
  email,
  emailVerified,
  twoFactorEnabled,
  onToggle2FA,
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUpdatedNotice, setPasswordUpdatedNotice] = useState(false);

  const handlePasswordUpdated = () => {
    setPasswordUpdatedNotice(true);
    setTimeout(() => setPasswordUpdatedNotice(false), 3500);
  };

  return (
    <Card className="p-6 md:p-8 space-y-6">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Account & Security
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your credentials, login verification, and security preferences.
        </p>
      </div>

      {passwordUpdatedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>Password updated successfully.</span>
        </div>
      )}

      <div className="divide-y divide-slate-100 space-y-5">
        {/* 1. Email Verification Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Email Verification
                </h4>
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                    <AlertTriangle size={11} /> Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {email}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Primary email used for security confirmations and project invite
                notifications.
              </p>
            </div>
          </div>

          {!emailVerified && (
            <button className="text-xs font-bold text-[#4361EE] hover:underline shrink-0">
              Resend verification email
            </button>
          )}
        </div>

        {/* 2. Password Change Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4361EE] flex items-center justify-center shrink-0 mt-0.5">
              <KeyRound size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Password</h4>
              <p className="text-xs text-slate-500 font-mono tracking-widest mt-0.5">
                ••••••••••••••••
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Last updated 3 months ago.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#F4F7FB] hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80 transition-colors shrink-0"
          >
            Change Password
          </button>
        </div>

        {/* 3. Two-Factor Authentication Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Two-Factor Authentication (2FA)
                </h4>
                {twoFactorEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#4361EE] border border-indigo-100">
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                Secures your account by requiring an authenticator code (TOTP)
                from your mobile app in addition to your password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle2FA}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-colors shrink-0 ${
              twoFactorEnabled
                ? "bg-white text-rose-600 hover:bg-rose-50 border-rose-200"
                : "bg-[#4361EE] text-white hover:bg-[#3451DE] border-transparent shadow-xs"
            }`}
          >
            {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordUpdated={handlePasswordUpdated}
      />
    </Card>
  );
};

export default AccountSecuritySection;
