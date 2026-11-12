import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  updateUserProfile,
  clearError,
  logout as logoutAction,
} from '../store/authSlice.js';
import { authService } from '../services/auth.service.js';
import { showToast } from '../../../shared/utils/toast.js';
import { clearTeamCache } from '../../team/hooks/useTeam.js';
import { clearNotificationsCache } from '../../notifications/hooks/useNotifications.js';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = useCallback(async (credentials) => {
    try {
      dispatch(loginStart());
      const data = await authService.login(credentials);
      dispatch(loginSuccess(data));
      showToast.auth.loginSuccess();
      return data;
    } catch (err) {
      const errMsg = err.message || 'Login failed';
      dispatch(loginFailure(errMsg));
      showToast.auth.loginError(err);
      throw err;
    }
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    try {
      dispatch(loginStart());
      const data = await authService.register(userData);
      dispatch(registerSuccess(data));
      showToast.auth.registerSuccess();
      return data;
    } catch (err) {
      const errMsg = err.message || 'Registration failed';
      dispatch(loginFailure(errMsg));
      showToast.auth.registerError(err);
      throw err;
    }
  }, [dispatch]);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      dispatch(loginStart());
      const data = await authService.googleLogin(credential);
      dispatch(loginSuccess(data));
      showToast.auth.loginSuccess();
      return data;
    } catch (err) {
      const errMsg = err.message || 'Google sign in failed';
      dispatch(loginFailure(errMsg));
      showToast.auth.loginError(err);
      throw err;
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await authService.getCurrentUser();
      const freshUser = response?.user;
      if (freshUser) {
        dispatch(updateUserProfile(freshUser));
        return freshUser;
      }
      return null;
    } catch (err) {
      if (err?.status === 401) {
        dispatch(logoutAction());
      }
      return null;
    }
  }, [dispatch, token]);

  const updateProfile = useCallback((updatedFields) => {
    dispatch(updateUserProfile(updatedFields));
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    clearTeamCache();
    clearNotificationsCache();
    showToast.auth.logoutSuccess();
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    checkAuth,
    updateProfile,
    clearAuthError,
    logout,
  };
}

export default useAuth;
