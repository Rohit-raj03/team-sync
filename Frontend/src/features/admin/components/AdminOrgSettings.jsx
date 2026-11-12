import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Shield,
  Download,
  CheckCircle2,
  Lock,
  Save,
  Clock,
} from 'lucide-react';

/**
 * Feature Component: AdminOrgSettings
 * Layer: features/admin/components/
 * Responsibility: Organization-level administration settings, security policies, and workspace backups.
 */
export const AdminOrgSettings = ({ onSaveSettings }) => {
  const [settings, setSettings] = useState({
    orgName: 'AgentraTeam Enterprise Inc.',
    domain: 'agentrateam.io',
    timezone: 'Asia/Kolkata (GMT+05:30)',
    enforce2FA: true,
    sessionTimeout: '12 Hours',
    retentionDays: '90 Days',
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings?.(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Organization & System Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure root parameters, corporate domains, and workspace authentication rules.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>Organization settings saved successfully.</span>
        </div>
      )}

      {/* General Org Profile Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 size={16} className="text-primary" />
          <h3 className="font-bold text-slate-800">Company Identity</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Organization Name</label>
            <input
              type="text"
              value={settings.orgName}
              onChange={(e) =>
                setSettings({ ...settings, orgName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Allowed Email Domain</label>
            <input
              type="text"
              value={settings.domain}
              onChange={(e) =>
                setSettings({ ...settings, domain: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">System Timezone</label>
            <input
              type="text"
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Audit Log Retention</label>
            <select
              value={settings.retentionDays}
              onChange={(e) =>
                setSettings({ ...settings, retentionDays: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="30 Days">30 Days</option>
              <option value="90 Days">90 Days</option>
              <option value="180 Days">180 Days</option>
              <option value="1 Year">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield size={16} className="text-purple-600" />
          <h3 className="font-bold text-slate-800">Security & Authentication Policy</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Enforce Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Require all project managers and contributors to configure an authenticator app.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enforce2FA}
              onChange={(e) =>
                setSettings({ ...settings, enforce2FA: e.target.checked })
              }
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Backup & Export */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-slate-900">Data Snapshot & Backup</h3>
          <p className="text-slate-400 mt-0.5">
            Download a full JSON archive of all projects, users, tasks, and audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('System snapshot exported successfully as teamsync-backup.json')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Download size={14} />
          <span>Export Workspace Data</span>
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all"
        >
          <Save size={14} />
          <span>Save Organization Settings</span>
        </button>
      </div>
    </form>
  );
};

