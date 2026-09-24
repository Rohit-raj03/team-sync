import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/authSlice.js';
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
      dispatch(loginSuccess(data));
      return data;
    } catch (err) {
      dispatch(loginFailure(err.message || 'Registration failed'));
      throw err;
    }
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
    logout,
  };
}
