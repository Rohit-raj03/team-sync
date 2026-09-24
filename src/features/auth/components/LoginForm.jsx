import React, { useState } from 'react';
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
