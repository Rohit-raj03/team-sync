import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Shield,
  Filter,
  Check,
  X,
  Mail,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { AdminConfirmationModal } from './AdminConfirmationModal.jsx';

const TEAMS_LIST = [
  'All Teams',
  'Frontend Engineering',
  'Core Platform',
  'Product Design',
  'Product Management',
  'Infrastructure',
];

const ROLES_LIST = ['All Roles', 'Admin', 'Project Manager', 'Team Member'];

/**
 * Feature Component: AdminUserManagement
 * Layer: features/admin/components/
 * Responsibility: Complete administrative user management with data table, searching, filtering, creation modal, edit modal, status toggling, and destructive confirmation.
 */
export const AdminUserManagement = ({
  users = [],
  onAddUser,
  onUpdateUser,
  onToggleStatus,
  onRemoveUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Add / Edit User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Team Member',
    jobTitle: '',
    team: 'Frontend Engineering',
  });
  const [formError, setFormError] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    confirmVariant: 'danger',
    onConfirm: () => {},
  });

  // Filtered & Paginated Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.jobTitle?.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
      const matchesTeam = teamFilter === 'All Teams' || u.team === teamFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.status === 'active') ||
        (statusFilter === 'INACTIVE' && u.status === 'inactive');

      return matchesSearch && matchesRole && matchesTeam && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, teamFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      role: 'Team Member',
      jobTitle: 'Software Engineer',
      team: 'Frontend Engineering',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      jobTitle: user.jobTitle || '',
      team: user.team || 'Frontend Engineering',
    });
    setFormError('');
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please enter both name and email address.');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, formData);
      setEditingUser(null);
    } else {
      onAddUser(formData);
      setIsAddModalOpen(false);
    }
  };

  const promptDeactivate = (user) => {
    const isActivating = user.status === 'inactive';
    setConfirmModal({
      isOpen: true,
      title: isActivating ? `Activate ${user.name}?` : `Deactivate ${user.name}?`,
      message: isActivating
        ? `This user will regain access to their projects, tasks, and system permissions.`
        : `This user will be suspended immediately and cannot log into Team Sync until reactivated.`,
      confirmLabel: isActivating ? 'Activate Account' : 'Deactivate User',
      confirmVariant: isActivating ? 'warning' : 'danger',
      onConfirm: () => onToggleStatus(user.id),
    });
  };

  const promptDelete = (user) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${user.name} permanently?`,
      message: `Are you sure you want to delete this user? All their direct permissions will be revoked. This action cannot be undone.`,
      confirmLabel: 'Delete User Permanently',
      confirmVariant: 'danger',
      onConfirm: () => onRemoveUser(user.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage organization members, assign roles, and configure system access.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>Add New User</span>
        </button>
      </div>

      {/* 2. Filter & Search Toolbar */}
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:ring-2 focus:ring-[#4361EE]"
            >
              {ROLES_LIST.map((r) => (
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
              onChange={(e) => {
                setTeamFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:ring-2 focus:ring-[#4361EE]"
            >
              {TEAMS_LIST.map((t) => (
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
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-[#4361EE] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'ALL' ? 'All Members' : st === 'ACTIVE' ? 'Active' : 'Deactivated'}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            Showing {filteredUsers.length} total users
          </span>
        </div>
      </div>

      {/* 3. User Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
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
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                              onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                              }}
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
                              ? 'bg-blue-50 text-[#4361EE] border border-blue-100'
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
                            onClick={() => setViewingUser(user)}
                            title="View User Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-indigo-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Deactivate / Activate */}
                          <button
                            type="button"
                            onClick={() => promptDeactivate(user)}
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
                            onClick={() => promptDelete(user)}
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
            Page {currentPage} of {totalPages} ({filteredUsers.length} total users)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === pg
                    ? 'bg-[#4361EE] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
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
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. vikramj"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, team: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {TEAMS_LIST.filter((t) => t !== 'All Teams').map((t) => (
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
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View User Profile Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">User Profile Details</h3>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center space-y-2">
              <img
                src={viewingUser.avatar}
                alt={viewingUser.name}
                className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-indigo-50 shadow-xs"
              />
              <h4 className="text-base font-bold text-slate-900">{viewingUser.name}</h4>
              <p className="text-xs text-slate-500">@{viewingUser.username}</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge variant={viewingUser.role === 'Admin' ? 'danger' : 'primary'}>
                  {viewingUser.role}
                </Badge>
                <Badge variant={viewingUser.status === 'active' ? 'success' : 'default'}>
                  {viewingUser.status}
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Team:</span>
                <span className="font-semibold text-slate-800">{viewingUser.team}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Job Title:</span>
                <span className="font-semibold text-slate-800">{viewingUser.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Active:</span>
                <span className="font-semibold text-slate-800">{viewingUser.lastActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined Organization:</span>
                <span className="font-semibold text-slate-800">{viewingUser.joinedDate || '2026-01-01'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Destructive Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

