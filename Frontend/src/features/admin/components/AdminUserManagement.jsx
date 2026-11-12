import React, { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { AdminUserFilters } from './AdminUserFilters.jsx';
import { AdminUserTable } from './AdminUserTable.jsx';
import { AdminUserFormModal } from './AdminUserFormModal.jsx';
import { AdminUserDetailsModal } from './AdminUserDetailsModal.jsx';
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

const DEFAULT_FORM_DATA = {
  name: '',
  email: '',
  username: '',
  role: 'Team Member',
  jobTitle: 'Software Engineer',
  team: 'Frontend Engineering',
};

/**
 * Feature Component: AdminUserManagement
 * Layer: features/admin/components/
 * Responsibility: Coordinator for organization member management, delegating to focused subcomponents:
 * - AdminUserFilters: Multi-parameter search toolbar, role dropdown, team dropdown, and status pills
 * - AdminUserTable: Responsive user management data table with row actions and pagination
 * - AdminUserFormModal: Modal dialog for adding or editing an organization member
 * - AdminUserDetailsModal: Modal dialog presenting comprehensive profile details for a selected member
 * - AdminConfirmationModal: Destructive action safeguards for activation, deactivation, and deletion
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

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
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
    setFormData(DEFAULT_FORM_DATA);
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

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        : `This user will be suspended immediately and cannot log into AgentraTeam until reactivated.`,
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Add New User</span>
        </button>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <AdminUserFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        roleFilter={roleFilter}
        onRoleChange={(val) => {
          setRoleFilter(val);
          setCurrentPage(1);
        }}
        rolesList={ROLES_LIST}
        teamFilter={teamFilter}
        onTeamChange={(val) => {
          setTeamFilter(val);
          setCurrentPage(1);
        }}
        teamsList={TEAMS_LIST}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        totalFilteredUsers={filteredUsers.length}
      />

      {/* 3. User Data Table */}
      <AdminUserTable
        users={paginatedUsers}
        totalUsers={filteredUsers.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewUser={setViewingUser}
        onEditUser={openEditModal}
        onToggleStatus={promptDeactivate}
        onDeleteUser={promptDelete}
      />

      {/* 4. Add / Edit User Modal */}
      <AdminUserFormModal
        isOpen={isAddModalOpen || !!editingUser}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
        }}
        editingUser={editingUser}
        formData={formData}
        onFieldChange={handleFieldChange}
        onSubmit={handleSaveForm}
        formError={formError}
        teamsList={TEAMS_LIST}
      />

      {/* 5. View User Profile Modal */}
      <AdminUserDetailsModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />

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

export default AdminUserManagement;
