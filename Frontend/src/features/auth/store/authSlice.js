import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../../shared/utils/localStorage.js';

const initialToken = storage.get('auth_token', null);
const initialUser = storage.get('auth_user', {
  id: 'u-1',
  name: 'Rohit Raj',
  email: 'rohit@teamsync.io',
  role: 'admin',
  jobTitle: 'Frontend Developer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces',
});

const initialState = {
  token: initialToken || 'mock_token_teamsync_123',
  user: initialUser,
  isAuthenticated: Boolean(initialToken || initialUser),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.token = action.payload.token || action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      storage.set('auth_token', state.token);
      storage.set('auth_user', state.user);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.token = action.payload.token || action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      storage.set('auth_token', state.token);
      storage.set('auth_user', state.user);
    },
    updateUserProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
      storage.set('auth_user', state.user);
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      storage.remove('auth_token');
      storage.remove('auth_user');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  updateUserProfile,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
