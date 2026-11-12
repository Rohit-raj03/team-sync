import React from 'react';
import {
  Shield,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';

/**
 * Feature Subcomponent: AdminUserTable
 * Layer: features/admin/components/
 * Responsibility: Responsive user management data table with row actions and pagination.
 */
export const AdminUserTable = ({
  users = [],
  totalUsers = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Name & Username</th>
              <th className="py-3.5 px-4">Email Address</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Team</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Last Active</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => {
                const isActive = user.status === 'active';
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar
                            src={user.avatar}
                            name={user.name}
                            size="sm"
                            className="ring-2 ring-slate-100"
                          />
                          {isActive && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === 'Admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : user.role === 'Project Manager'
                            ? 'bg-blue-50 text-primary border border-blue-100'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Shield size={10} />
                        <span>{user.role}</span>
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {user.team}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {user.jobTitle || 'Contributor'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {user.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => onViewUser(user)}
                          title="View User Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEditUser(user)}
                          title="Edit User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Deactivate / Activate */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                          title={isActive ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user)}
                          title="Delete User Permanently"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No users match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Page {currentPage} of {totalPages} ({totalUsers} total users)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                currentPage === pg
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserTable;
