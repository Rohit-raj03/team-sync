import React from 'react';
import { Search } from 'lucide-react';

/**
 * Feature Subcomponent: AdminUserFilters
 * Layer: features/admin/components/
 * Responsibility: Multi-parameter search toolbar, role dropdown, team dropdown, and status pills.
 */
export const AdminUserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  rolesList = [],
  teamFilter,
  onTeamChange,
  teamsList = [],
  statusFilter,
  onStatusChange,
  totalFilteredUsers = 0,
}) => {
  return (
    <div className="p-4 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search users by name, email, username, or title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Role Filter */}
        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:ring-2 focus:ring-primary"
          >
            {rolesList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div className="sm:col-span-3">
          <select
            value={teamFilter}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:ring-2 focus:ring-primary"
          >
            {teamsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'All Members' : st === 'ACTIVE' ? 'Active' : 'Deactivated'}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-semibold text-slate-500">
          Showing {totalFilteredUsers} total users
        </span>
      </div>
    </div>
  );
};

export default AdminUserFilters;
