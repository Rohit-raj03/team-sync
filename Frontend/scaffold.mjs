import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createFile(relPath, content) {
  const fullPath = path.join(rootDir, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`Created: ${relPath}`);
}

// 1. Root & Public
createFile('.env', `VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TeamSync
`);

ensureDir(path.join(rootDir, 'public', 'images'));

// 2. Shared Constants & Config
createFile('src/config/env.js', `export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TeamSync',
};
`);

createFile('src/shared/constants/routes.js', `export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASK_DETAILS: (id = ':id') => \`/tasks/\${id}\`,
  PROJECTS: '/projects',
  PROJECT_DETAILS: (id = ':id') => \`/projects/\${id}\`,
  TEAM: '/team',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};
`);

createFile('src/shared/constants/taskStatus.js', `export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
};

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};
`);

// 3. Shared Utils
createFile('src/shared/utils/formatDate.js', `export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
`);

createFile('src/shared/utils/formatTime.js', `export function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
`);

createFile('src/shared/utils/localStorage.js', `export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to set localStorage', e);
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};
`);

// 4. Shared API
createFile('src/shared/api/axios.js', `import axios from 'axios';
import { env } from '../../config/env.js';
import { storage } from '../utils/localStorage.js';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get('auth_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove('auth_token');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;
`);

createFile('src/shared/api/apiClient.js', `import axiosInstance from './axios.js';

export const apiClient = {
  get: (url, params) => axiosInstance.get(url, { params }),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  patch: (url, data) => axiosInstance.patch(url, data),
  delete: (url) => axiosInstance.delete(url),
};
`);

// 5. Shared Hooks
createFile('src/shared/hooks/useDebounce.js', `import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
`);

createFile('src/shared/hooks/useModal.js', `import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
`);

// 6. Shared UI Components
createFile('src/shared/components/ui/Button.jsx', `import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={\`\${baseClasses} \${variants[variant] || variants.primary} \${sizes[size] || sizes.md} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
};
`);

createFile('src/shared/components/ui/Input.jsx', `import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={\`w-full px-3.5 py-2 rounded-xl border \${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-indigo-400'
        } bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all \${className}\`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
`);

createFile('src/shared/components/ui/Modal.jsx', `import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className={\`bg-white w-full \${maxWidth} rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all\`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
`);

createFile('src/shared/components/ui/Dropdown.jsx', `import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={\`absolute \${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-30 focus:outline-none\`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
`);

createFile('src/shared/components/ui/Badge.jsx', `import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-50 text-indigo-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
        variants[variant] || variants.default
      } \${className}\`}
    >
      {children}
    </span>
  );
};
`);

createFile('src/shared/components/ui/Avatar.jsx', `import React from 'react';

export const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={\`rounded-full object-cover \${sizes[size] || sizes.md} \${className}\`}
      />
    );
  }

  return (
    <div
      className={\`rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center \${
        sizes[size] || sizes.md
      } \${className}\`}
    >
      {initials}
    </div>
  );
};
`);

createFile('src/shared/components/ui/Loader.jsx', `import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={\`animate-spin rounded-full border-indigo-600 border-t-transparent \${
          sizes[size] || sizes.md
        } \${className}\`}
      />
    </div>
  );
};
`);

// 7. Shared Layout Components
createFile('src/shared/components/layout/Navbar.jsx', `import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar.jsx';
import { useAuth } from '../../../features/auth/hooks/useAuth.js';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <Avatar name={user?.name || 'Jane Doe'} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'Jane Doe'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Product Lead'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
`);

createFile('src/shared/components/layout/Sidebar.jsx', `import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../../features/auth/hooks/useAuth.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
    { label: 'Tasks', icon: CheckSquare, to: ROUTES.TASKS },
    { label: 'Projects', icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: 'Team', icon: Users, to: ROUTES.TEAM },
    { label: 'Profile', icon: User, to: ROUTES.PROFILE },
    { label: 'Settings', icon: Settings, to: ROUTES.SETTINGS },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
        />
      )}
      <aside
        className={\`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 \${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }\`}
      >
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white text-base">
            TS
          </div>
          <span className="font-bold text-lg text-white tracking-tight">TeamSync</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  \`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors \${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }\`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
`);

createFile('src/shared/components/layout/PageHeader.jsx', `import React from 'react';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
`);

createFile('src/shared/components/layout/MainLayout.jsx', `import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`);

// 8. Shared Styles
createFile('src/styles/globals.css', `@import "tailwindcss";

@layer base {
  body {
    @apply text-slate-900 bg-slate-50 antialiased;
  }
}
`);

createFile('src/styles/index.css', `@import "./globals.css";
`);

// 9. Feature: Auth
createFile('src/features/auth/store/authSlice.js', `import { createSlice } from '@reduxjs/toolkit';
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
`);

createFile('src/features/auth/services/auth.service.js', `import { apiClient } from '../../../shared/api/apiClient.js';

export const authService = {
  login: async (credentials) => {
    // Replace with: return apiClient.post('/auth/login', credentials);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'jwt_mock_token_abc123',
          user: {
            id: '1',
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'Product Lead',
          },
        });
      }, 500);
    });
  },
  register: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'jwt_mock_token_abc123',
          user: {
            id: '2',
            name: data.name,
            email: data.email,
            role: 'Team Member',
          },
        });
      }, 500);
    });
  },
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
};
`);

createFile('src/features/auth/hooks/useAuth.js', `import { useSelector, useDispatch } from 'react-redux';
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
`);

createFile('src/features/auth/validation/auth.schema.js', `export const validateLogin = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\\S+@\\S+\\.\\S+/.test(values.email)) {
    errors.email = 'Email is invalid';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};

export const validateRegister = (values) => {
  const errors = validateLogin(values);
  if (!values.name) {
    errors.name = 'Full name is required';
  }
  return errors;
};
`);

createFile('src/features/auth/components/LoginForm.jsx', `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { validateLogin } from '../validation/auth.schema.js';
import { ROUTES } from '../../../shared/constants/routes.js';

export const LoginForm = () => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      await login(values);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setErrors({ form: err.message || 'Invalid credentials' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {errors.form}
        </div>
      )}
      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="alex@teamsync.io"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <div className="text-center text-sm text-slate-500 pt-2">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-indigo-600 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </form>
  );
};
`);

createFile('src/features/auth/components/RegisterForm.jsx', `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { validateRegister } from '../validation/auth.schema.js';
import { ROUTES } from '../../../shared/constants/routes.js';

export const RegisterForm = () => {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      await register(values);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {errors.form}
        </div>
      )}
      <Input
        label="Full Name"
        name="name"
        placeholder="Alex Johnson"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="alex@teamsync.io"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <div className="text-center text-sm text-slate-500 pt-2">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};
`);

// 10. Feature: Tasks
createFile('src/features/tasks/store/taskSlice.js', `import { createSlice } from '@reduxjs/toolkit';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

const initialTasks = [
  {
    id: 't-1',
    title: 'Configure Tailwind CSS v4 Theme',
    description: 'Set up custom design tokens and fluid typography for TeamSync.',
    status: TASK_STATUS.COMPLETED,
    priority: TASK_PRIORITY.HIGH,
    dueDate: '2026-09-28',
    assignedTo: 'Alex Johnson',
    projectId: 'p-1',
  },
  {
    id: 't-2',
    title: 'Design Team Collaboration Dashboard',
    description: 'Create responsive Kanban board and timeline overview views.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.URGENT,
    dueDate: '2026-09-30',
    assignedTo: 'Sarah Chen',
    projectId: 'p-1',
  },
  {
    id: 't-3',
    title: 'Implement Role-Based Access Control',
    description: 'Secure project endpoints and team member invites with permissions.',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: '2026-10-05',
    assignedTo: 'Dev Team',
    projectId: 'p-2',
  },
];

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: initialTasks,
    filter: 'ALL',
    search: '',
  },
  reducers: {
    addTask(state, action) {
      state.tasks.unshift(action.payload);
    },
    updateTask(state, action) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload };
      }
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setTaskFilter(state, action) {
      state.filter = action.payload;
    },
    setTaskSearch(state, action) {
      state.search = action.payload;
    },
  },
});

export const { addTask, updateTask, deleteTask, setTaskFilter, setTaskSearch } = taskSlice.actions;
export default taskSlice.reducer;
`);

createFile('src/features/tasks/services/task.service.js', `import { apiClient } from '../../../shared/api/apiClient.js';

export const taskService = {
  getTasks: async (params) => apiClient.get('/tasks', params),
  getTaskById: async (id) => apiClient.get(\`/tasks/\${id}\`),
  createTask: async (data) => apiClient.post('/tasks', data),
  updateTask: async (id, data) => apiClient.put(\`/tasks/\${id}\`, data),
  deleteTask: async (id) => apiClient.delete(\`/tasks/\${id}\`),
};
`);

createFile('src/features/tasks/utils/taskHelpers.js', `import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return 'success';
    case TASK_STATUS.IN_PROGRESS:
      return 'primary';
    case TASK_STATUS.IN_REVIEW:
      return 'warning';
    default:
      return 'default';
  }
};

export const getPriorityBadgeVariant = (priority) => {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return 'danger';
    case TASK_PRIORITY.HIGH:
      return 'warning';
    case TASK_PRIORITY.MEDIUM:
      return 'primary';
    default:
      return 'default';
  }
};
`);

createFile('src/features/tasks/validation/task.schema.js', `export const validateTask = (values) => {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = 'Title is required';
  }
  return errors;
};
`);

createFile('src/features/tasks/hooks/useTasks.js', `import { useSelector, useDispatch } from 'react-redux';
import { addTask, updateTask, deleteTask, setTaskFilter, setTaskSearch } from '../store/taskSlice.js';

export function useTasks() {
  const dispatch = useDispatch();
  const { tasks, filter, search } = useSelector((state) => state.tasks);

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'ALL' || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    search,
    addTask: (task) => dispatch(addTask({ ...task, id: \`t-\${Date.now()}\` })),
    updateTask: (task) => dispatch(updateTask(task)),
    deleteTask: (id) => dispatch(deleteTask(id)),
    setFilter: (f) => dispatch(setTaskFilter(f)),
    setSearch: (s) => dispatch(setTaskSearch(s)),
  };
}
`);

createFile('src/features/tasks/hooks/useTask.js', `import { useSelector } from 'react-redux';

export function useTask(id) {
  const task = useSelector((state) =>
    state.tasks.tasks.find((t) => t.id === id)
  );
  return { task };
}
`);

createFile('src/features/tasks/components/TaskCard.jsx', `import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '../utils/taskHelpers.js';
import { formatDate } from '../../../shared/utils/formatDate.js';

export const TaskCard = ({ task, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant={getPriorityBadgeVariant(task.priority)}>
          {task.priority}
        </Badge>
        <Badge variant={getStatusBadgeVariant(task.status)}>
          {task.status.replace('_', ' ')}
        </Badge>
      </div>

      <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {task.title}
      </h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
        {task.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        <span className="font-medium text-slate-600">{task.assignedTo}</span>
      </div>
    </div>
  );
};
`);

createFile('src/features/tasks/components/TaskList.jsx', `import React from 'react';
import { TaskCard } from './TaskCard.jsx';

export const TaskList = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No tasks found</p>
        <p className="text-xs text-slate-400 mt-1">Try changing filters or add a new task.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
      ))}
    </div>
  );
};
`);

createFile('src/features/tasks/components/TaskFilter.jsx', `import React from 'react';
import { TASK_STATUS } from '../../../shared/constants/taskStatus.js';

export const TaskFilter = ({ currentFilter, onFilterChange }) => {
  const filters = ['ALL', ...Object.values(TASK_STATUS)];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={\`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors \${
            currentFilter === f
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }\`}
        >
          {f.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};
`);

createFile('src/features/tasks/components/TaskForm.jsx', `import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

export const TaskForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: 'Alex Johnson',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            {Object.values(TASK_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            {Object.values(TASK_PRIORITY).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Task
        </Button>
      </div>
    </form>
  );
};
`);

createFile('src/features/tasks/components/TaskStatus.jsx', `import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getStatusBadgeVariant } from '../utils/taskHelpers.js';

export const TaskStatus = ({ status }) => {
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status ? status.replace('_', ' ') : 'N/A'}
    </Badge>
  );
};
`);

createFile('src/features/tasks/components/TaskDetails.jsx', `import React from 'react';
import { TaskStatus } from './TaskStatus.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getPriorityBadgeVariant } from '../utils/taskHelpers.js';
import { formatDate } from '../../../shared/utils/formatDate.js';

export const TaskDetails = ({ task }) => {
  if (!task) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <TaskStatus status={task.status} />
        <Badge variant={getPriorityBadgeVariant(task.priority)}>
          {task.priority} Priority
        </Badge>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Assignee: {task.assignedTo}</span>
      </div>
    </div>
  );
};
`);

// 11. Feature: Projects
createFile('src/features/projects/store/projectSlice.js', `import { createSlice } from '@reduxjs/toolkit';

const initialProjects = [
  {
    id: 'p-1',
    name: 'TeamSync Web App',
    description: 'Real-time collaborative task workspace for distributed dev teams.',
    membersCount: 8,
    tasksCount: 24,
    status: 'ACTIVE',
  },
  {
    id: 'p-2',
    name: 'Mobile Client v2',
    description: 'React Native companion app for seamless task tracking on iOS & Android.',
    membersCount: 5,
    tasksCount: 14,
    status: 'PLANNING',
  },
];

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: initialProjects,
  },
  reducers: {
    addProject(state, action) {
      state.projects.unshift(action.payload);
    },
  },
});

export const { addProject } = projectSlice.actions;
export default projectSlice.reducer;
`);

createFile('src/features/projects/services/project.service.js', `import { apiClient } from '../../../shared/api/apiClient.js';

export const projectService = {
  getProjects: () => apiClient.get('/projects'),
  getProjectById: (id) => apiClient.get(\`/projects/\${id}\`),
  createProject: (data) => apiClient.post('/projects', data),
};
`);

createFile('src/features/projects/hooks/useProjects.js', `import { useSelector, useDispatch } from 'react-redux';
import { addProject } from '../store/projectSlice.js';

export function useProjects() {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);

  return {
    projects,
    addProject: (p) => dispatch(addProject({ ...p, id: \`p-\${Date.now()}\` })),
  };
}
`);

createFile('src/features/projects/components/ProjectCard.jsx', `import React from 'react';
import { FolderKanban, Users, CheckCircle } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

export const ProjectCard = ({ project, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <FolderKanban size={20} />
        </div>
        <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
          {project.status}
        </Badge>
      </div>

      <h3 className="text-base font-bold text-slate-800">{project.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>

      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{project.membersCount || 0} Members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} />
          <span>{project.tasksCount || 0} Tasks</span>
        </div>
      </div>
    </div>
  );
};
`);

createFile('src/features/projects/components/ProjectList.jsx', `import React from 'react';
import { ProjectCard } from './ProjectCard.jsx';

export const ProjectList = ({ projects, onProjectClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onClick={() => onProjectClick?.(p)} />
      ))}
    </div>
  );
};
`);

createFile('src/features/projects/components/ProjectForm.jsx', `import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';

export const ProjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Project</Button>
      </div>
    </form>
  );
};
`);

createFile('src/features/projects/components/ProjectMembers.jsx', `import React from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';

export const ProjectMembers = ({ members = [] }) => {
  return (
    <div className="flex -space-x-2">
      {members.map((m, idx) => (
        <Avatar key={idx} name={m.name} size="sm" className="border-2 border-white" />
      ))}
    </div>
  );
};
`);

// 12. Feature: Team
createFile('src/features/team/services/team.service.js', `import { apiClient } from '../../../shared/api/apiClient.js';

export const teamService = {
  getMembers: () => apiClient.get('/team/members'),
  inviteMember: (data) => apiClient.post('/team/invite', data),
};
`);

createFile('src/features/team/hooks/useTeam.js', `import { useState } from 'react';

const mockMembers = [
  { id: 'm-1', name: 'Alex Johnson', email: 'alex@teamsync.io', role: 'Project Lead', status: 'Online' },
  { id: 'm-2', name: 'Sarah Chen', email: 'sarah@teamsync.io', role: 'UI/UX Designer', status: 'In a meeting' },
  { id: 'm-3', name: 'David Kim', email: 'david@teamsync.io', role: 'Backend Engineer', status: 'Offline' },
];

export function useTeam() {
  const [members, setMembers] = useState(mockMembers);

  const inviteMember = (data) => {
    setMembers((prev) => [...prev, { ...data, id: \`m-\${Date.now()}\`, status: 'Invited' }]);
  };

  return { members, inviteMember };
}
`);

createFile('src/features/team/components/MemberCard.jsx', `import React from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

export const MemberCard = ({ member }) => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={member.name} size="md" />
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{member.name}</h4>
          <p className="text-xs text-slate-500">{member.email}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={member.status === 'Online' ? 'success' : 'default'}>
          {member.role}
        </Badge>
        <p className="text-[11px] text-slate-400 mt-1">{member.status}</p>
      </div>
    </div>
  );
};
`);

createFile('src/features/team/components/MemberList.jsx', `import React from 'react';
import { MemberCard } from './MemberCard.jsx';

export const MemberList = ({ members = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
};
`);

createFile('src/features/team/components/InviteMember.jsx', `import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';

export const InviteMember = ({ onInvite, onCancel }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Team Member');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onInvite({ email, name: email.split('@')[0], role });
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Member Email"
        type="email"
        placeholder="colleague@teamsync.io"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="Team Member">Team Member</option>
          <option value="Product Lead">Product Lead</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Send Invite</Button>
      </div>
    </form>
  );
};
`);

// 13. Feature: Notifications
createFile('src/features/notifications/services/notification.service.js', `import { apiClient } from '../../../shared/api/apiClient.js';

export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
};
`);

createFile('src/features/notifications/hooks/useNotifications.js', `import { useState } from 'react';

const mockNotifications = [
  { id: '1', message: 'Alex assigned you to Configure Tailwind CSS', time: '10m ago', unread: true },
  { id: '2', message: 'Sarah updated project Mobile Client v2', time: '2h ago', unread: false },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return { notifications, markAllAsRead };
}
`);

createFile('src/features/notifications/components/NotificationList.jsx', `import React from 'react';
import { useNotifications } from '../hooks/useNotifications.js';

export const NotificationList = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-semibold text-sm text-slate-800">Notifications</span>
        <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:underline">
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={\`p-3 rounded-xl text-xs flex items-center justify-between \${
              n.unread ? 'bg-indigo-50/60 font-medium text-slate-800' : 'text-slate-500'
            }\`}
          >
            <span>{n.message}</span>
            <span className="text-slate-400 pl-2">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
`);

// 14. Presentation Layer (Pages)
createFile('src/pages/auth/LoginPage.jsx', `import React from 'react';
import { LoginForm } from '../../features/auth/components/LoginForm.jsx';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-xl mb-3 shadow-md shadow-indigo-200">
            TS
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your TeamSync workspace</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
`);

createFile('src/pages/auth/RegisterPage.jsx', `import React from 'react';
import { RegisterForm } from '../../features/auth/components/RegisterForm.jsx';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-xl mb-3 shadow-md shadow-indigo-200">
            TS
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="text-sm text-slate-500 mt-1">Start collaborating with your team today</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};
`);

createFile('src/pages/dashboard/DashboardPage.jsx', `import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { useTasks } from '../../features/tasks/hooks/useTasks.js';
import { useProjects } from '../../features/projects/hooks/useProjects.js';
import { TaskList } from '../../features/tasks/components/TaskList.jsx';
import { CheckCircle2, Clock, FolderKanban, Users } from 'lucide-react';

export const DashboardPage = () => {
  const { allTasks } = useTasks();
  const { projects } = useProjects();

  const stats = [
    { label: 'Total Tasks', value: allTasks.length, icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'In Progress', value: allTasks.filter((t) => t.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Projects', value: projects.length, icon: FolderKanban, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Team Members', value: 8, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Overview"
        subtitle="Monitor project health, sprints, and task progress in real time."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className={\`p-3 rounded-2xl \${s.color}\`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Tasks</h3>
        <TaskList tasks={allTasks.slice(0, 3)} />
      </div>
    </div>
  );
};
`);

createFile('src/pages/tasks/TasksPage.jsx', `import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { TaskList } from '../../features/tasks/components/TaskList.jsx';
import { TaskFilter } from '../../features/tasks/components/TaskFilter.jsx';
import { TaskForm } from '../../features/tasks/components/TaskForm.jsx';
import { TaskDetails } from '../../features/tasks/components/TaskDetails.jsx';
import { useTasks } from '../../features/tasks/hooks/useTasks.js';
import { Plus } from 'lucide-react';

export const TasksPage = () => {
  const { tasks, filter, setFilter, addTask } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleCreate = (data) => {
    addTask(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage and organize your team's workflow."
        action={
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create Task</span>
          </Button>
        }
      />

      <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
      <TaskList tasks={tasks} onTaskClick={(task) => setSelectedTask(task)} />

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Overview"
      >
        <TaskDetails task={selectedTask} />
      </Modal>
    </div>
  );
};
`);

createFile('src/pages/tasks/TaskDetailsPage.jsx', `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { TaskDetails } from '../../features/tasks/components/TaskDetails.jsx';
import { useTask } from '../../features/tasks/hooks/useTask.js';
import { ArrowLeft } from 'lucide-react';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { task } = useTask(id);

  return (
    <div className="space-y-6 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500"
      >
        <ArrowLeft size={16} /> Back to tasks
      </Button>
      <PageHeader title="Task Details" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100">
        <TaskDetails task={task} />
      </div>
    </div>
  );
};
`);

createFile('src/pages/projects/ProjectsPage.jsx', `import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { ProjectList } from '../../features/projects/components/ProjectList.jsx';
import { ProjectForm } from '../../features/projects/components/ProjectForm.jsx';
import { useProjects } from '../../features/projects/hooks/useProjects.js';
import { Plus } from 'lucide-react';

export const ProjectsPage = () => {
  const { projects, addProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (data) => {
    addProject(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Track initiatives, milestones, and deliverables."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>New Project</span>
          </Button>
        }
      />

      <ProjectList projects={projects} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
`);

createFile('src/pages/projects/ProjectDetailsPage.jsx', `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { ArrowLeft } from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500"
      >
        <ArrowLeft size={16} /> Back to projects
      </Button>
      <PageHeader title={\`Project: \${id}\`} subtitle="Project details and milestones" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-500">Project timeline and tasks roadmap view.</p>
      </div>
    </div>
  );
};
`);

createFile('src/pages/team/TeamPage.jsx', `import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { MemberList } from '../../features/team/components/MemberList.jsx';
import { InviteMember } from '../../features/team/components/InviteMember.jsx';
import { useTeam } from '../../features/team/hooks/useTeam.js';
import { UserPlus } from 'lucide-react';

export const TeamPage = () => {
  const { members, inviteMember } = useTeam();
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = (data) => {
    inviteMember(data);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage your team colleagues and roles."
        action={
          <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            <span>Invite Member</span>
          </Button>
        }
      />

      <MemberList members={members} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite Teammate"
      >
        <InviteMember onInvite={handleInvite} onCancel={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
`);

createFile('src/pages/profile/ProfilePage.jsx', `import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Avatar } from '../../shared/components/ui/Avatar.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Input } from '../../shared/components/ui/Input.jsx';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account preferences" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar name={user?.name || 'User'} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Input label="Full Name" defaultValue={user?.name || ''} />
          <Input label="Email Address" defaultValue={user?.email || ''} disabled />
          <Input label="Role / Title" defaultValue={user?.role || ''} />
        </div>

        <div className="flex justify-end pt-2">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
`);

createFile('src/pages/settings/SettingsPage.jsx', `import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Configure system and workspace parameters" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">Receive email digests and desktop updates.</p>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Email notifications for assigned tasks</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Weekly team digest report</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};
`);

// 15. Providers & Store
createFile('src/app/store.js', `import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice.js';
import taskReducer from '../features/tasks/store/taskSlice.js';
import projectReducer from '../features/projects/store/projectSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    projects: projectReducer,
  },
});
`);

createFile('src/app/providers/QueryProvider.jsx', `import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
`);

createFile('src/app/providers/AppProviders.jsx', `import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store.js';
import { QueryProvider } from './QueryProvider.jsx';

export const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryProvider>
        {children}
      </QueryProvider>
    </Provider>
  );
};
`);

// 16. Router Layer
createFile('src/app/router/routes.js', `export { ROUTES } from '../../shared/constants/routes.js';
`);

createFile('src/app/router/ProtectedRoute.jsx', `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { ROUTES } from '../../shared/constants/routes.js';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
`);

createFile('src/app/router/AppRouter.jsx', `import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from './routes.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { MainLayout } from '../../shared/components/layout/MainLayout.jsx';

import { LoginPage } from '../../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../../pages/auth/RegisterPage.jsx';
import { DashboardPage } from '../../pages/dashboard/DashboardPage.jsx';
import { TasksPage } from '../../pages/tasks/TasksPage.jsx';
import { TaskDetailsPage } from '../../pages/tasks/TaskDetailsPage.jsx';
import { ProjectsPage } from '../../pages/projects/ProjectsPage.jsx';
import { ProjectDetailsPage } from '../../pages/projects/ProjectDetailsPage.jsx';
import { TeamPage } from '../../pages/team/TeamPage.jsx';
import { ProfilePage } from '../../pages/profile/ProfilePage.jsx';
import { SettingsPage } from '../../pages/settings/SettingsPage.jsx';

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.TASKS,
            element: <TasksPage />,
          },
          {
            path: ROUTES.TASK_DETAILS(':id'),
            element: <TaskDetailsPage />,
          },
          {
            path: ROUTES.PROJECTS,
            element: <ProjectsPage />,
          },
          {
            path: ROUTES.PROJECT_DETAILS(':id'),
            element: <ProjectDetailsPage />,
          },
          {
            path: ROUTES.TEAM,
            element: <TeamPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
`);

// 17. App Layer Entry Points
createFile('src/app/App.jsx', `import React from 'react';
import { AppRouter } from './router/AppRouter.jsx';

export const App = () => {
  return <AppRouter />;
};

export default App;
`);

createFile('src/app/main.jsx', `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';
import App from './App.jsx';
import { AppProviders } from './providers/AppProviders.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
`);

createFile('src/App.jsx', `import App from './app/App.jsx';
export default App;
`);

createFile('src/main.jsx', `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './app/App.jsx';
import { AppProviders } from './app/providers/AppProviders.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
`);

console.log('✅ Project scaffolded successfully!');

