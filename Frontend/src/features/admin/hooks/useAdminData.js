import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addUser as addUserAction,
  updateUser as updateUserAction,
  toggleUserStatus as toggleUserStatusAction,
  removeUser as removeUserAction,
  updatePermission as updatePermissionAction,
  addLog as addLogAction,
  showToast as showToastAction,
  hideToast as hideToastAction,
} from '../store/adminSlice.js';
import { useProjects } from '../../projects/hooks/useProjects.js';
import { useTasks } from '../../tasks/hooks/useTasks.js';

/**
 * Feature Hook: useAdminData
 * Layer: features/admin/hooks/
 * Responsibility: Coordinates all administrative datasets using centralized Redux Toolkit state.
 */
export function useAdminData() {
  const dispatch = useDispatch();
  const { users, permissions, activityLogs, toast } = useSelector((state) => state.admin);

  const { allProjects, deleteProject } = useProjects();
  const { allTasks, updateTask, deleteTask } = useTasks();

  const showToast = (message, type = 'success') => {
    dispatch(showToastAction({ message, type }));
    setTimeout(() => {
      dispatch(hideToastAction());
    }, 3500);
  };

  const addLog = (user, action, resource, category = 'General') => {
    dispatch(
      addLogAction({
        user,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
        action,
        resource,
        category,
      })
    );
  };

  // 1. User Management Operations (Redux Dispatched)
  const addUser = (userData) => {
    const newUser = {
      id: `u-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      username: userData.username || userData.name.toLowerCase().replace(/\s+/g, ''),
      role: userData.role || 'Team Member',
      jobTitle: userData.jobTitle || 'Contributor',
      team: userData.team || 'Engineering',
      status: 'active',
      lastActive: 'Just now',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    dispatch(addUserAction(newUser));
    addLog('Admin', 'added a new user', newUser.name, 'Users');
    showToast(`User "${newUser.name}" has been successfully added.`);
    return newUser;
  };

  const updateUser = (userId, updatedFields) => {
    dispatch(updateUserAction({ id: userId, fields: updatedFields }));
    showToast('User details updated successfully.');
  };

  const toggleUserStatus = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    dispatch(toggleUserStatusAction(userId));
    addLog(
      'Admin',
      newStatus === 'active' ? 'activated user' : 'deactivated user',
      targetUser.name,
      'Users'
    );
    showToast(
      `User "${targetUser.name}" marked as ${newStatus === 'active' ? 'Active' : 'Deactivated'}.`,
      newStatus === 'active' ? 'success' : 'info'
    );
  };

  const removeUser = (userId) => {
    const target = users.find((u) => u.id === userId);
    dispatch(removeUserAction(userId));
    if (target) {
      addLog('Admin', 'removed user account', target.name, 'Users');
    }
    showToast(`User account deleted permanently.`, 'info');
  };

  // 2. Roles & Permissions Operations (Redux Dispatched)
  const updatePermission = (role, permissionKey, value) => {
    dispatch(updatePermissionAction({ role, permissionKey, value }));
    addLog('Admin', `updated permissions for ${role}`, permissionKey, 'Security');
    showToast(`Permissions updated for role: ${role}`);
  };

  // 3. Computed Overview Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p) => p.status === 'ACTIVE').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'Done'
    ).length;

    // Check overdue tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = allTasks.filter((t) => {
      const isDone = t.status === 'COMPLETED' || t.status === 'Done';
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
  };
}

export default useAdminData;
