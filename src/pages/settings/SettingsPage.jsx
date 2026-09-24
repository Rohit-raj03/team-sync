import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Configure system and workspace parameters" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">Receive email digests and desktop updates.</p>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Email notifications for assigned tasks</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Weekly team digest report</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};
