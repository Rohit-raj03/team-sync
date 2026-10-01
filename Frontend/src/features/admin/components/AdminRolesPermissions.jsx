import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  FolderKanban,
  ListTodo,
  BarChart3,
  Settings,
  Check,
  X,
  Info,
} from 'lucide-react';

const PERMISSION_CONFIGS = [
  {
    key: 'manage_users',
    label: 'Manage Users',
    description: 'Create, modify, invite, deactivate, and delete user profiles and workspace accounts.',
    icon: Users,
  },
  {
    key: 'manage_projects',
    label: 'Manage Projects',
    description: 'Create new project workspaces, allocate managers, archive, and adjust deadlines.',
    icon: FolderKanban,
  },
  {
    key: 'manage_tasks',
    label: 'Manage Tasks',
    description: 'Create tasks, modify assignments, change statuses, and delete deliverables.',
    icon: ListTodo,
  },
  {
    key: 'manage_teams',
    label: 'Manage Teams',
    description: 'Form department squads, reassign contributors, and manage team leads.',
    icon: Users,
  },
  {
    key: 'view_analytics',
    label: 'View Analytics',
    description: 'Inspect velocity charts, task turnaround times, and organizational performance metrics.',
    icon: BarChart3,
  },
  {
    key: 'manage_settings',
    label: 'Manage Organization Settings',
    description: 'Modify company domain whitelists, authentication policies, and security credentials.',
    icon: Settings,
  },
];

const ROLES = ['Admin', 'Project Manager', 'Team Member'];

/**
 * Feature Component: AdminRolesPermissions
 * Layer: features/admin/components/
 * Responsibility: Interactive security matrix allowing administrators to inspect and configure role capabilities.
 */
export const AdminRolesPermissions = ({ permissions, onUpdatePermission }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Roles & Permissions Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure granular access controls for each level of the organization.
        </p>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
            <h3 className="text-xs font-bold text-purple-950">Admin</h3>
          </div>
          <p className="text-[11px] text-purple-800/80 leading-relaxed pt-1">
            Unrestricted access across all operational, security, user, and financial resources.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#4361EE] flex items-center justify-center font-bold">
              <FolderKanban size={16} />
            </div>
            <h3 className="text-xs font-bold text-blue-950">Project Manager</h3>
          </div>
          <p className="text-[11px] text-blue-800/80 leading-relaxed pt-1">
            Deliverable oversight, project scheduling, task assignment, and analytics inspection.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Team Member</h3>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            Execute assigned tasks, tick subtasks, collaborate in messages, and upload file assets.
          </p>
        </div>
      </div>

      {/* Interactive Permission Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6 w-1/2">Permission Capability</th>
                {ROLES.map((role) => (
                  <th key={role} className="py-4 px-4 text-center">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_CONFIGS.map((perm) => {
                const Icon = perm.icon;
                return (
                  <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={15} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{perm.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Toggles */}
                    {ROLES.map((role) => {
                      const isEnabled = !!permissions[role]?.[perm.key];
                      const isAdminRole = role === 'Admin';

                      return (
                        <td key={role} className="py-4 px-4 text-center">
                          <button
                            type="button"
                            disabled={isAdminRole}
                            onClick={() => onUpdatePermission(role, perm.key, !isEnabled)}
                            className={`w-9 h-9 rounded-xl inline-flex items-center justify-center transition-all ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            } ${isAdminRole ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                            title={
                              isAdminRole
                                ? 'Admin permissions cannot be revoked'
                                : `Toggle ${perm.label} for ${role}`
                            }
                          >
                            {isEnabled ? (
                              <Check size={16} strokeWidth={2.5} />
                            ) : (
                              <X size={15} />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-800 flex items-center gap-2.5">
        <Info size={16} className="text-amber-600 shrink-0" />
        <span>
          Admin role maintains full cryptographic overrides. Changes take effect on the next session refresh for all connected users.
        </span>
      </div>
    </div>
  );
};

