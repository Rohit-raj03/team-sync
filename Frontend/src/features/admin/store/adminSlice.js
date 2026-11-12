import { createSlice } from '@reduxjs/toolkit';

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

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    stats: null,
    permissions: INITIAL_ROLE_PERMISSIONS,
    activityLogs: [],
    loading: false,
    error: null,
  },
  reducers: {
    setUsers(state, action) {
      state.users = action.payload || [];
    },
    setStats(state, action) {
      state.stats = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addUser(state, action) {
      state.users.unshift(action.payload);
    },
    updateUser(state, action) {
      const { id, fields } = action.payload;
      const idx = state.users.findIndex((u) => (u.id || u._id) === id);
      if (idx !== -1) {
        state.users[idx] = { ...state.users[idx], ...fields };
      }
    },
    toggleUserStatus(state, action) {
      const userId = action.payload;
      const user = state.users.find((u) => (u.id || u._id) === userId);
      if (user) {
        const currentActive = user.isActive !== undefined ? user.isActive : user.status === 'active';
        user.isActive = !currentActive;
        user.status = !currentActive ? 'active' : 'inactive';
      }
    },
    removeUser(state, action) {
      state.users = state.users.filter((u) => (u.id || u._id) !== action.payload);
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
  },
});

export const {
  setUsers,
  setStats,
  setLoading,
  setError,
  addUser,
  updateUser,
  toggleUserStatus,
  removeUser,
  updatePermission,
  addLog,
} = adminSlice.actions;

export default adminSlice.reducer;
