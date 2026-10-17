import { createSlice } from '@reduxjs/toolkit';

const INITIAL_ADMIN_USERS = [
  {
    id: 'u-1',
    name: 'Rohit Raj',
    email: 'rohit@teamsync.io',
    username: 'rohitraj',
    role: 'Admin',
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
];

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
    view_analytics: false,
    manage_settings: false,
  },
};

const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'log-1',
    user: 'Rohit Raj',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces',
    action: 'created a new project',
    resource: 'TeamSync Web App',
    category: 'Projects',
    timestamp: '10 minutes ago',
  },
  {
    id: 'log-2',
    user: 'Aman Kumar',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces',
    action: 'updated Task #102',
    resource: 'API Rate Limiting',
    category: 'Tasks',
    timestamp: '25 minutes ago',
  },
  {
    id: 'log-3',
    user: 'Priya Singh',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    action: 'completed a task',
    resource: 'Design Tokens Specification',
    category: 'Tasks',
    timestamp: '1 hour ago',
  },
  {
    id: 'log-4',
    user: 'Admin',
    userAvatar: null,
    action: 'added a new user',
    resource: 'Sarah Chen (Frontend)',
    category: 'Users',
    timestamp: '2 hours ago',
  },
];

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: INITIAL_ADMIN_USERS,
    permissions: INITIAL_ROLE_PERMISSIONS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    toast: null,
  },
  reducers: {
    addUser(state, action) {
      state.users.unshift(action.payload);
    },
    updateUser(state, action) {
      const { id, fields } = action.payload;
      const idx = state.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        state.users[idx] = { ...state.users[idx], ...fields };
      }
    },
    toggleUserStatus(state, action) {
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
      }
    },
    removeUser(state, action) {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    updatePermission(state, action) {
      const { role, permissionKey, value } = action.payload;
      if (state.permissions[role]) {
        state.permissions[role][permissionKey] = value;
      }
    },
    addLog(state, action) {
      state.activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        ...action.payload,
      });
    },
    showToast(state, action) {
      state.toast = typeof action.payload === 'string'
        ? { message: action.payload, type: 'success' }
        : action.payload;
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const {
  addUser,
  updateUser,
  toggleUserStatus,
  removeUser,
  updatePermission,
  addLog,
  showToast,
  hideToast,
} = adminSlice.actions;

export default adminSlice.reducer;
