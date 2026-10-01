import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTeam } from '../../team/hooks/useTeam.js';
import { useProjects } from '../../projects/hooks/useProjects.js';
import { useTasks } from '../../tasks/hooks/useTasks.js';

// Initial admin managed users dataset
const INITIAL_ADMIN_USERS = [
  {
    id: 'u-1',
    name: 'Rohit Raj',
    email: 'rohit@teamsync.io',
    username: 'rohitraj',
    role: 'Team Member',
    jobTitle: 'Frontend Developer',
    team: 'Frontend Engineering',
    status: 'active',
    lastActive: '2 minutes ago',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2026-01-15',
  },
  {
    id: 'u-2',
    name: 'Aman Kumar',
    email: 'aman@teamsync.io',
    username: 'amankumar',
    role: 'Team Member',
    jobTitle: 'Backend Developer',
    team: 'Core Platform',
    status: 'active',
    lastActive: '15 minutes ago',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2026-02-01',
  },
  {
    id: 'u-3',
    name: 'Priya Singh',
    email: 'priya@teamsync.io',
    username: 'priyasingh',
    role: 'Project Manager',
    jobTitle: 'UI/UX Designer',
    team: 'Product Design',
    status: 'active',
    lastActive: '1 hour ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2026-01-20',
  },
  {
    id: 'u-4',
    name: 'Angelina Davis',
    email: 'angelina.davis@teamsync.io',
    username: 'angelina',
    role: 'Admin',
    jobTitle: 'Lead Product Designer',
    team: 'Product Design',
    status: 'active',
    lastActive: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2025-11-10',
  },
  {
    id: 'u-5',
    name: 'Alex Johnson',
    email: 'alex@teamsync.io',
    username: 'alexj',
    role: 'Project Manager',
    jobTitle: 'Project Lead',
    team: 'Product Management',
    status: 'active',
    lastActive: '3 hours ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2025-12-01',
  },
  {
    id: 'u-6',
    name: 'Sarah Chen',
    email: 'sarah@teamsync.io',
    username: 'sarahc',
    role: 'Team Member',
    jobTitle: 'Design System Engineer',
    team: 'Frontend Engineering',
    status: 'active',
    lastActive: '5 hours ago',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2026-03-05',
  },
  {
    id: 'u-7',
    name: 'David Kim',
    email: 'david@teamsync.io',
    username: 'davidk',
    role: 'Team Member',
    jobTitle: 'DevOps & Cloud Engineer',
    team: 'Infrastructure',
    status: 'inactive',
    lastActive: '4 days ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2025-10-14',
  },
  {
    id: 'u-8',
    name: 'Elena Rostova',
    email: 'elena@teamsync.io',
    username: 'elenar',
    role: 'Project Manager',
    jobTitle: 'Product Manager',
    team: 'Product Management',
    status: 'active',
    lastActive: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
    joinedDate: '2026-01-10',
  },
];

// Initial Role Permissions Matrix
const INITIAL_ROLE_PERMISSIONS = {
  Admin: {
    manage_users: true,
    manage_projects: true,
    manage_tasks: true,
    manage_teams: true,
    view_analytics: true,
    manage_settings: true,
  },
  'Project Manager': {
    manage_users: false,
    manage_projects: true,
    manage_tasks: true,
    manage_teams: true,
    view_analytics: true,
    manage_settings: false,
  },
  'Team Member': {
    manage_users: false,
    manage_projects: false,
    manage_tasks: true,
    manage_teams: false,
    view_analytics: true,
    manage_settings: false,
  },
};

// Initial Activity Logs
const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'act-1',
    user: 'Rohit Raj',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces',
    action: 'created a new project',
    resource: 'TeamSync Web App v2',
    category: 'Projects',
    timestamp: '10 minutes ago',
  },
  {
    id: 'act-2',
    user: 'Aman Kumar',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces',
    action: 'updated Task #102',
    resource: 'Database Schema Optimization',
    category: 'Tasks',
    timestamp: '28 minutes ago',
  },
  {
    id: 'act-3',
    user: 'Priya Singh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    action: 'completed a task',
    resource: 'Figma Design System Review',
    category: 'Tasks',
    timestamp: '1 hour ago',
  },
  {
    id: 'act-4',
    user: 'Angelina Davis',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    action: 'added a new user',
    resource: 'Sarah Chen (Frontend Engineer)',
    category: 'Users',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-5',
    user: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    action: 'reallocated team members',
    resource: 'Mobile Client v2 Squad',
    category: 'Teams',
    timestamp: 'Yesterday at 4:30 PM',
  },
  {
    id: 'act-6',
    user: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    action: 'deployed build to staging',
    resource: 'Production Cluster #US-East',
    category: 'System',
    timestamp: '2 days ago',
  },
];

// Singleton in-memory stores for Admin operations
let sharedAdminUsers = [...INITIAL_ADMIN_USERS];
let sharedPermissions = { ...INITIAL_ROLE_PERMISSIONS };
let sharedLogs = [...INITIAL_ACTIVITY_LOGS];

const adminListeners = new Set();
const notifyAdminListeners = () => {
  adminListeners.forEach((l) => l());
};

/**
 * Feature Hook: useAdminData
 * Layer: features/admin/hooks/
 * Responsibility: Coordinates all administrative datasets, role permission rules, system logs, user CRUD operations, and cross-application analytics.
 */
export function useAdminData() {
  const [, setTick] = useState(0);
  const { allProjects, deleteProject } = useProjects();
  const { allTasks, updateTask, deleteTask } = useTasks();

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    adminListeners.add(rerender);
    return () => adminListeners.delete(rerender);
  }, []);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // Add Log Entry
  const addLog = (user, action, resource, category = 'General') => {
    const newLog = {
      id: `act-${Date.now()}`,
      user,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      action,
      resource,
      category,
      timestamp: 'Just now',
    };
    sharedLogs = [newLog, ...sharedLogs];
    notifyAdminListeners();
  };

  // 1. User Management Operations
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
    sharedAdminUsers = [newUser, ...sharedAdminUsers];
    addLog('Admin', 'added a new user', newUser.name, 'Users');
    notifyAdminListeners();
    showToast(`User "${newUser.name}" has been successfully added.`);
    return newUser;
  };

  const updateUser = (userId, updatedFields) => {
    sharedAdminUsers = sharedAdminUsers.map((u) =>
      u.id === userId ? { ...u, ...updatedFields } : u
    );
    notifyAdminListeners();
    showToast('User details updated successfully.');
  };

  const toggleUserStatus = (userId) => {
    const targetUser = sharedAdminUsers.find((u) => u.id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    sharedAdminUsers = sharedAdminUsers.map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    addLog(
      'Admin',
      newStatus === 'active' ? 'activated user' : 'deactivated user',
      targetUser.name,
      'Users'
    );
    notifyAdminListeners();
    showToast(
      `User "${targetUser.name}" marked as ${newStatus === 'active' ? 'Active' : 'Deactivated'}.`,
      newStatus === 'active' ? 'success' : 'info'
    );
  };

  const removeUser = (userId) => {
    const target = sharedAdminUsers.find((u) => u.id === userId);
    sharedAdminUsers = sharedAdminUsers.filter((u) => u.id !== userId);
    if (target) {
      addLog('Admin', 'removed user account', target.name, 'Users');
    }
    notifyAdminListeners();
    showToast(`User account deleted permanently.`, 'info');
  };

  // 2. Roles & Permissions Operations
  const updatePermission = (role, permissionKey, value) => {
    sharedPermissions = {
      ...sharedPermissions,
      [role]: {
        ...sharedPermissions[role],
        [permissionKey]: value,
      },
    };
    addLog('Admin', `updated permissions for ${role}`, permissionKey, 'Security');
    notifyAdminListeners();
    showToast(`Permissions updated for role: ${role}`);
  };

  // 3. Computed Overview Metrics
  const metrics = useMemo(() => {
    const totalUsers = sharedAdminUsers.length;
    const activeUsers = sharedAdminUsers.filter((u) => u.status === 'active').length;
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p) => p.status === 'ACTIVE').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'Done'
    ).length;

    // Check overdue tasks (dueDate < today and not completed)
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
  }, [allProjects, allTasks]);

  return {
    users: sharedAdminUsers,
    permissions: sharedPermissions,
    activityLogs: sharedLogs,
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

