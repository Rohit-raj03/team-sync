import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

/**
 * Feature Subcomponent: AdminUserDetailsModal
 * Layer: features/admin/components/
 * Responsibility: Modal dialog presenting comprehensive profile details for a selected organization member.
 */
export const AdminUserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">User Profile Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-center space-y-2">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-indigo-50 shadow-xs"
          />
          <h4 className="text-base font-bold text-slate-900">{user.name}</h4>
          <p className="text-xs text-slate-500">@{user.username}</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant={user.role === 'Admin' ? 'danger' : 'primary'}>
              {user.role}
            </Badge>
            <Badge variant={user.status === 'active' ? 'success' : 'default'}>
              {user.status}
            </Badge>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Team:</span>
            <span className="font-semibold text-slate-800">{user.team}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Job Title:</span>
            <span className="font-semibold text-slate-800">{user.jobTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Active:</span>
            <span className="font-semibold text-slate-800">{user.lastActive}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Joined Organization:</span>
            <span className="font-semibold text-slate-800">{user.joinedDate || '2026-01-01'}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsModal;
