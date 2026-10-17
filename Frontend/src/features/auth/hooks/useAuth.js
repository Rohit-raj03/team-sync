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

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const data = await authService.login(credentials);
      dispatch(loginSuccess(data));
      return data;
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed'));
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      dispatch(loginStart());
      const data = await authService.register(userData);
      dispatch(registerSuccess(data));
      return data;
    } catch (err) {
      dispatch(loginFailure(err.message || 'Registration failed'));
      throw err;
    }
  };

  const checkAuth = async () => {
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
  };

  const updateProfile = (updatedFields) => {
    dispatch(updateUserProfile(updatedFields));
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    checkAuth,
    updateProfile,
    clearAuthError,
    logout,
  };
}
