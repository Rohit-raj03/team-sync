import React, { useState } from 'react';
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
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">Account Role</label>
        <select
          name="role"
          value={values.role || 'user'}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="user">Team Member (Standard)</option>
          <option value="admin">Administrator (Full Access)</option>
        </select>
      </div>
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
