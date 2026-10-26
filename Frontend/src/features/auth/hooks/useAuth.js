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

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
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
  };

  const register = async (userData) => {
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
    showToast.auth.logoutSuccess();
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
