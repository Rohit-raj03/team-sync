import React from "react";
import { useProfile } from "../../features/profile/hooks/useProfile.js";
import { ProfilePhotoSection } from "../../features/profile/components/ProfilePhotoSection.jsx";
import { PersonalInfoForm } from "../../features/profile/components/PersonalInfoForm.jsx";
import { AccountSecuritySection } from "../../features/profile/components/AccountSecuritySection.jsx";
import { Button } from "../../shared/components/ui/Button.jsx";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

/**
 * Presentation Layer: ProfilePage
 * Layer: pages/profile/
 * Responsibility: Complete modern Profile Update page for Team Sync, divided into Personal Information and Account & Security sections with unsaved changes tracking.
 */
export const ProfilePage = () => {
  const {
    formData,
    errors,
    serverError,
    isDirty,
    isSaving,
    saveSuccess,
    handleChange,
    handlePhotoUpload,
    handlePhotoRemove,
    saveChanges,
    cancelChanges,
    toggle2FA,
  } = useProfile();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await saveChanges();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Profile Settings
            </h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, credentials, contact information, and
            workspace presence.
          </p>
        </div>

        {/* Top Quick Actions (Visible when dirty) */}
        {isDirty && (
          <div className="flex items-center gap-3 animate-fade-in">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelChanges}
              disabled={isSaving}
              className="text-xs font-semibold rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveChanges}
              disabled={isSaving}
              className="text-xs font-semibold rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white shadow-md shadow-indigo-200"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin" /> Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>Your profile information has been successfully updated.</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {serverError && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle size={18} className="text-rose-500 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Section 1: Profile Photo Header */}
        <ProfilePhotoSection
          avatar={formData.avatar}
          fullName={formData.fullName}
          onUpload={handlePhotoUpload}
          onRemove={handlePhotoRemove}
        />

        {/* Section 2: Personal Information */}
        <PersonalInfoForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />

        {/* Section 3: Account & Security */}
        <AccountSecuritySection
          email={formData.email}
          emailVerified={formData.emailVerified}
          twoFactorEnabled={formData.twoFactorEnabled}
          onToggle2FA={toggle2FA}
        />

        {/* Bottom Persistent Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)]">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-slate-800">
              {isDirty ? "You have unsaved changes" : "All changes saved"}
            </p>
            <p className="text-[11px] text-slate-400">
              {isDirty
                ? "Save your changes before navigating away to keep your profile up to date."
                : "Last profile update was synced with your workspace."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelChanges}
              disabled={!isDirty || isSaving}
              className="text-xs font-semibold rounded-2xl flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isSaving}
              className="text-xs font-semibold rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex-1 sm:flex-initial"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin" /> Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
