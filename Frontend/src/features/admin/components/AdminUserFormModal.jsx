import React from 'react';
import { UserPlus, X, Check } from 'lucide-react';

/**
 * Feature Subcomponent: AdminUserFormModal
 * Layer: features/admin/components/
 * Responsibility: Modal form dialog for adding new members or editing existing user attributes.
 */
export const AdminUserFormModal = ({
  isOpen,
  onClose,
  editingUser,
  formData,
  onFieldChange,
  onSubmit,
  formError,
  teamsList = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? 'Edit User Information' : 'Add New Organization Member'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure profile credentials and role permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Joshi"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Username</label>
              <input
                type="text"
                placeholder="e.g. vikramj"
                value={formData.username}
                onChange={(e) => onFieldChange('username', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. vikram@teamsync.io"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => onFieldChange('role', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Admin">Admin</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Team Member">Team Member</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Team</label>
              <select
                value={formData.team}
                onChange={(e) => onFieldChange('team', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {teamsList
                  .filter((t) => t !== 'All Teams')
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Job Title / Discipline</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.jobTitle}
              onChange={(e) => onFieldChange('jobTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserFormModal;
