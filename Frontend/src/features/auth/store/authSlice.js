import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../../shared/utils/localStorage.js';

const initialToken = storage.get('auth_token', null);
const initialUser = storage.get('auth_user', null);

const initialState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken && initialUser),
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
      const rawUser = action.payload.user;
      state.user = rawUser
        ? { ...rawUser, id: rawUser.id || rawUser._id }
        : null;
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
      const rawUser = action.payload.user;
      state.user = rawUser
        ? { ...rawUser, id: rawUser.id || rawUser._id }
        : null;
      state.isAuthenticated = true;
      state.error = null;
      storage.set('auth_token', state.token);
      storage.set('auth_user', state.user);
    },
    updateUserProfile(state, action) {
      const updated = { ...state.user, ...action.payload };
      if (updated._id && !updated.id) updated.id = updated._id;
      state.user = updated;
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
