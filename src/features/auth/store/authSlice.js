import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../../shared/utils/localStorage.js';

const initialToken = storage.get('auth_token', null);
const initialUser = storage.get('auth_user', {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@teamsync.io',
  role: 'Project Lead',
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken || 'mock_token_123',
    user: initialUser,
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      storage.set('auth_token', action.payload.token);
      storage.set('auth_user', action.payload.user);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      storage.remove('auth_token');
      storage.remove('auth_user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
