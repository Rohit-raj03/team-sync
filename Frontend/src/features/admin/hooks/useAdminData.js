import { useMemo, useEffect, useCallback, useRef } from 'react';
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
} from '../store/adminSlice.js';
import { adminService } from '../services/admin.service.js';
import { useProjects } from '../../projects/hooks/useProjects.js';
import { useTasks } from '../../tasks/hooks/useTasks.js';
import { showToast as showAppToast } from '../../../shared/utils/toast.js';
import { formatDateForInput } from '../../../shared/utils/formatDate.js';

// Module-level deduplication and caching for admin API requests
let inFlightAdminPromise = null;
let lastAdminFetchTimestamp = 0;
const ADMIN_CACHE_TTL_MS = 15000;

// Normalize server user object to the shape expected by admin components
const normalizeUser = (u) => {
  if (!u) return null;
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
    joinedDate: formatDateForInput(u.createdAt) || '2026-01-01',
  };
};

/**
 * Feature Hook: useAdminData
 * Layer: features/admin/hooks/
 * Responsibility: Coordinates all administrative datasets using centralized Redux Toolkit state and live backend APIs.
 */
export function useAdminData(options = {}) {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserName =
    currentUser?.name || currentUser?.username || 'Administrator';

  const { users, permissions, activityLogs, loading, error } = useSelector(
    (state) => state.admin
  );

  const { allProjects, deleteProject } = useProjects({ autoFetch: false });
  const { allTasks, updateTask, deleteTask } = useTasks({ autoFetch: false });

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const showToast = useCallback((message, type = 'success') => {
    if (type === 'error') {
      showAppToast.error(message);
    } else {
      showAppToast.success(message);
    }
  }, []);

  const addLog = useCallback(
    (user, action, resource, category = 'General') => {
      const resolvedUser =
        user && user !== 'Admin' ? user : currentUserName;
      dispatch(
        addLogAction({
          user: resolvedUser,
          userAvatar: currentUser?.avatar || null,
          action,
          resource,
          category,
        })
      );
    },
    [dispatch, currentUserName, currentUser?.avatar]
  );

  // Fetch real users and telemetry stats from live backend APIs with caching and deduplication
  const fetchAdminData = useCallback(async (force = false) => {
    const isCacheValid =
      usersRef.current.length > 0 &&
      Date.now() - lastAdminFetchTimestamp < ADMIN_CACHE_TTL_MS;

    if (!force && isCacheValid) {
      return { users: usersRef.current };
    }

    if (inFlightAdminPromise) {
      return inFlightAdminPromise;
    }

    inFlightAdminPromise = (async () => {
      try {
        if (usersRef.current.length === 0) {
          dispatch(setLoading(true));
        }

        const [usersRes, statsRes] = await Promise.allSettled([
          adminService.getUsers(),
          adminService.getStats(),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
          const normalized = usersRes.value.users
            .map(normalizeUser)
            .filter(Boolean);
          dispatch(setUsers(normalized));
          lastAdminFetchTimestamp = Date.now();
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
          dispatch(setStats(statsRes.value.stats));
        }

        return { users: usersRef.current };
      } catch (err) {
        console.error('Failed to load admin telemetry/users:', err.message);
        dispatch(setError(err.message));
        throw err;
      } finally {
        dispatch(setLoading(false));
        inFlightAdminPromise = null;
      }
    })();

    return inFlightAdminPromise;
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) {
      fetchAdminData();
    }
  }, [autoFetch, fetchAdminData]);

  // 1. User Management Operations (Live Backend API + Redux)
  const addUser = useCallback(async (userData) => {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        username: userData.username,
        role:
          userData.role === 'Admin'
            ? 'admin'
            : userData.role === 'Project Manager'
            ? 'manager'
            : 'user',
        jobTitle: userData.jobTitle,
        phone: userData.phone || '',
      };

      const res = await adminService.createUser(payload);
      const created = normalizeUser(res?.user || payload);
      dispatch(addUserAction(created));
      addLog(currentUserName, 'created a new user account', created.name, 'Users');
      showToast(`User "${created.name}" has been successfully added.`);
      return created;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to create user';
      showToast(msg, 'error');
      throw err;
    }
  }, [dispatch, currentUserName, addLog, showToast]);

  const updateUser = useCallback(async (userId, updatedFields) => {
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
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update user';
      showToast(msg, 'error');
    }
  }, [dispatch, showToast]);

  const toggleUserStatus = useCallback(async (userId) => {
    const targetUser = usersRef.current.find(
      (u) => u.id === userId || u._id === userId
    );
    if (!targetUser) return;
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    const newActiveState = newStatus === 'active';

    try {
      await adminService.toggleUserStatus(userId, newActiveState);
      dispatch(toggleUserStatusAction(userId));
      addLog(
        currentUserName,
        newStatus === 'active'
          ? 'activated user account'
          : 'deactivated user account',
        targetUser.name,
        'Users'
      );
      showToast(
        `User "${targetUser.name}" marked as ${
          newStatus === 'active' ? 'Active' : 'Deactivated'
        }.`,
        newStatus === 'active' ? 'success' : 'info'
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change user status';
      showToast(msg, 'error');
    }
  }, [dispatch, currentUserName, addLog, showToast]);

  const removeUser = useCallback(async (userId) => {
    const target = usersRef.current.find(
      (u) => u.id === userId || u._id === userId
    );
    try {
      await adminService.deleteUser(userId);
      dispatch(removeUserAction(userId));
      if (target) {
        addLog(currentUserName, 'removed user account', target.name, 'Users');
      }
      showToast('User account deleted permanently.', 'info');
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete user';
      showToast(msg, 'error');
    }
  }, [dispatch, currentUserName, addLog, showToast]);

  // 2. Roles & Permissions Operations
  const updatePermission = useCallback((role, permissionKey, value) => {
    dispatch(updatePermissionAction({ role, permissionKey, value }));
    addLog(
      currentUserName,
      `updated permissions for ${role}`,
      permissionKey,
      'Security'
    );
    showToast(`Permissions updated for role: ${role}`);
  }, [dispatch, currentUserName, addLog, showToast]);

  // 3. Computed Overview Metrics from real live data
  const metrics = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeProjects = Array.isArray(allProjects) ? allProjects : [];
    const safeTasks = Array.isArray(allTasks) ? allTasks : [];

    const totalUsers = safeUsers.length;
    const activeUsers = safeUsers.filter((u) => u.status === 'active').length;
    const totalProjects = safeProjects.length;
    const activeProjects = safeProjects.filter((p) => {
      const s = (p.status || '').toUpperCase();
      return s === 'ACTIVE' || s === 'IN_PROGRESS';
    }).length;
    const totalTasks = safeTasks.length;
    const completedTasks = safeTasks.filter((t) => {
      const s = (t.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'DONE';
    }).length;

    const todayStr = formatDateForInput(new Date());
    const overdueTasks = safeTasks.filter((t) => {
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
