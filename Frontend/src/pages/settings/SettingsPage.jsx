import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../shared/components/layout/PageHeader.jsx";
import { Card } from "../../shared/components/ui/Card.jsx";
import { Button } from "../../shared/components/ui/Button.jsx";

import { ROUTES } from "../../shared/constants/routes.js";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { storage } from "../../shared/utils/localStorage.js";
import { showToast } from "../../shared/utils/toast.js";
import {
  User,
  Shield,
  Bell,

  ChevronRight,

  CheckCircle2,



} from "lucide-react";

const DEFAULT_NOTIFICATIONS = {
  assignedTasks: true,
  weeklyDigest: true,
  directMessages: true,
  projectMilestones: false,
};

/**
 * Presentation Layer: SettingsPage
 * Layer: pages/settings/
 * Responsibility: Workspace and system settings hub with direct links to Profile Settings, security options, notification controls, and appearance.
 */
export const SettingsPage = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() =>
    storage.get("user_settings_notifications", DEFAULT_NOTIFICATIONS)
  );

  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    storage.set("user_settings_notifications", notifications);
    setSavedNotice(true);
    showToast.success("Workspace preferences saved successfully.");
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const displayName = user?.name || "Team Member";
  const displayUsername =
    user?.username || (user?.email ? user.email.split("@")[0] : "user");
  const displayJob = user?.jobTitle || "Contributor";
  const displayEmail = user?.email || "";
  const displayAvatar = user?.avatar;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage your personal profile, security credentials, and workspace preferences."
      />

      {savedNotice && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>Workspace preferences saved successfully.</span>
        </div>
      )}

      {/* 2. Primary Profile Settings Link Card */}
      <Card className="p-6 md:p-8 bg-linear-to-r from-white via-white to-indigo-50/40 border border-indigo-100/80 shadow-md shadow-indigo-100/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {displayName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-primary border border-indigo-100">
                  @{displayUsername}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{displayJob}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Action Link to Profile Page */}
          <Link
            to={ROUTES.PROFILE}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-98 shrink-0"
          >
            <User size={15} />
            <span>Profile Settings</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </Card>

      {/* 3. Settings Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile & Identity Shortcut */}
        <Link
          to={ROUTES.PROFILE}
          className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">
                Personal Information
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Edit your photo, name, username, bio, job title, and timezone.
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-primary transition-colors shrink-0 mt-1"
          />
        </Link>

        {/* Security & Credentials Shortcut */}
        <Link
          to={ROUTES.PROFILE}
          className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">
                Account & Security
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Manage password updates, 2FA authenticator, and verified emails.
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-primary transition-colors shrink-0 mt-1"
          />
        </Link>
      </div>

      {/* 4. Notification Preferences Form */}
      <form onSubmit={handleSave}>
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-400">
                Choose when and how AgentraTeam notifies you of activity.
              </p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-slate-50">
            <div className="flex items-center justify-between pt-3">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Task Assignments & Comments
                </h5>
                <p className="text-[11px] text-slate-400">
                  Notify me when someone assigns or comments on my task.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.assignedTasks}
                onChange={() => handleToggle("assignedTasks")}
                className="w-4 h-4 rounded text-primary focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Direct Messages & Mentions
                </h5>
                <p className="text-[11px] text-slate-400">
                  Receive desktop alerts when teammates send direct messages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.directMessages}
                onChange={() => handleToggle("directMessages")}
                className="w-4 h-4 rounded text-primary focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Project Milestones
                </h5>
                <p className="text-[11px] text-slate-400">
                  Daily digests of sprint deliverables and timeline completions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.projectMilestones}
                onChange={() => handleToggle("projectMilestones")}
                className="w-4 h-4 rounded text-primary focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h5 className="text-xs font-bold text-slate-800">
                  Weekly Team Digest
                </h5>
                <p className="text-[11px] text-slate-400">
                  Receive a weekly summary email of team performance.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={() => handleToggle("weeklyDigest")}
                className="w-4 h-4 rounded text-primary focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-200"
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SettingsPage;
