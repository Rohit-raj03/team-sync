import { useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setUsers,
  setStats,
  setLoading,
  setError,
  addUser as addUserAction,
  updateUser as updateUserAction,
  toggleUserStatus as toggleUserStatusAction,
  removeUser as removeUserAction,
  updatePermission as updatePermissionAction,
  addLog as addLogAction,
  showToast as showToastAction,
  hideToast as hideToastAction,
} from '../store/adminSlice.js';
import { adminService } from '../services/admin.service.js';
import { useProjects } from '../../projects/hooks/useProjects.js';
import { useTasks } from '../../tasks/hooks/useTasks.js';

/**
 * Feature Hook: useAdminData
 * Layer: features/admin/hooks/
 * Responsibility: Coordinates all administrative datasets using centralized Redux Toolkit state and live backend APIs.
 */
export function useAdminData() {
  const dispatch = useDispatch();
  const { users, permissions, activityLogs, toast, loading, error } = useSelector(
    (state) => state.admin
  );

  const { allProjects, deleteProject } = useProjects();
  const { allTasks, updateTask, deleteTask } = useTasks();

  const showToast = useCallback(
    (message, type = 'success') => {
      dispatch(showToastAction({ message, type }));
      setTimeout(() => {
        dispatch(hideToastAction());
      }, 3500);
    },
    [dispatch]
  );

  const addLog = useCallback(
    (user, action, resource, category = 'General') => {
      dispatch(
        addLogAction({
          user,
          userAvatar: null,
          action,
          resource,
          category,
        })
      );
    },
    [dispatch]
  );

  // Normalize server user object to the shape expected by admin components
  const normalizeUser = (u) => {
    const rawRole = (u.role || '').toLowerCase();
    let displayRole = 'Team Member';
    if (rawRole === 'admin') displayRole = 'Admin';
    else if (rawRole === 'manager') displayRole = 'Project Manager';

    const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

    return {
      id: u._id || u.id,
      _id: u._id || u.id,
      name: u.name || 'Anonymous User',
      email: u.email || '',
      username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
      role: displayRole,
      rawRole: u.role,
      jobTitle: u.jobTitle || (displayRole === 'Admin' ? 'Administrator' : 'Contributor'),
      team: u.team || 'Core Team',
      status: isActive ? 'active' : 'inactive',
      isActive,
      avatar: u.avatar || '',
      lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Recently',
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
    };
  };

  // Fetch real users and telemetry stats from live backend APIs
  const fetchAdminData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const [usersRes, statsRes] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getStats(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        const normalized = usersRes.value.users.map(normalizeUser);
        dispatch(setUsers(normalized));
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        dispatch(setStats(statsRes.value.stats));
      }
    } catch (err) {
      console.error('Failed to load admin telemetry/users:', err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // 1. User Management Operations (Live Backend API + Redux)
  const addUser = async (userData) => {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        username: userData.username,
        role: (userData.role === 'Admin' ? 'admin' : userData.role === 'Project Manager' ? 'manager' : 'user'),
        jobTitle: userData.jobTitle,
        phone: userData.phone || '',
      };

      const res = await adminService.createUser(payload);
      const created = normalizeUser(res?.user || payload);
      dispatch(addUserAction(created));
      addLog('Admin', 'created a new user account', created.name, 'Users');
      showToast(`User "${created.name}" has been successfully added.`);
      return created;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create user';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateUser = async (userId, updatedFields) => {
    try {
      if (updatedFields.role) {
        let backendRole = 'user';
        if (updatedFields.role === 'Admin') backendRole = 'admin';
        else if (updatedFields.role === 'Project Manager') backendRole = 'manager';
        await adminService.updateUserRole(userId, backendRole);
      }
      dispatch(updateUserAction({ id: userId, fields: updatedFields }));
      showToast('User details updated successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user';
      showToast(msg, 'error');
    }
  };

  const toggleUserStatus = async (userId) => {
    const targetUser = users.find((u) => u.id === userId || u._id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    const newActiveState = newStatus === 'active';

    try {
      await adminService.toggleUserStatus(userId, newActiveState);
      dispatch(toggleUserStatusAction(userId));
      addLog(
        'Admin',
        newStatus === 'active' ? 'activated user account' : 'deactivated user account',
        targetUser.name,
        'Users'
      );
      showToast(
        `User "${targetUser.name}" marked as ${newStatus === 'active' ? 'Active' : 'Deactivated'}.`,
        newStatus === 'active' ? 'success' : 'info'
      );
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change user status';
      showToast(msg, 'error');
    }
  };

  const removeUser = async (userId) => {
    const target = users.find((u) => u.id === userId || u._id === userId);
    try {
      await adminService.deleteUser(userId);
      dispatch(removeUserAction(userId));
      if (target) {
        addLog('Admin', 'removed user account', target.name, 'Users');
      }
      showToast('User account deleted permanently.', 'info');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete user';
      showToast(msg, 'error');
    }
  };

  // 2. Roles & Permissions Operations
  const updatePermission = (role, permissionKey, value) => {
    dispatch(updatePermissionAction({ role, permissionKey, value }));
    addLog('Admin', `updated permissions for ${role}`, permissionKey, 'Security');
    showToast(`Permissions updated for role: ${role}`);
  };

  // 3. Computed Overview Metrics from real live data
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p) => {
      const s = (p.status || '').toUpperCase();
      return s === 'ACTIVE' || s === 'IN_PROGRESS';
    }).length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => {
      const s = (t.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'DONE';
    }).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = allTasks.filter((t) => {
      const s = (t.status || '').toUpperCase();
      const isDone = s === 'COMPLETED' || s === 'DONE';
      return !isDone && t.dueDate && t.dueDate < todayStr;
    }).length;

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
    };
  }, [users, allProjects, allTasks]);

  return {
    users,
    permissions,
    activityLogs,
    metrics,
    allProjects,
    allTasks,
    toast,
    loading,
    error,
    showToast,
    addUser,
    updateUser,
    toggleUserStatus,
    removeUser,
    updatePermission,
    deleteProject,
    updateTask,
    deleteTask,
    addLog,
    refetch: fetchAdminData,
  };
}

export default useAdminData;
