import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { Input } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { validateLogin } from "../validation/auth.schema.js";
import { ROUTES } from "../../../shared/constants/routes.js";

export const LoginForm = () => {
  const [values, setValues] = useState({ email: "", password: "" });
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
      setErrors({ form: err.message || "Invalid credentials" });
    }
  };

  // Determine icon: if text doesn't contain '@' and has length, show User icon, else Mail icon
  const EmailOrUserIcon =
    values.email.length > 0 && !values.email.includes("@") ? User : Mail;

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
        icon={EmailOrUserIcon}
        error={errors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        icon={Lock}
        showPasswordToggle={true}
        error={errors.password}
      />
      <div className="flex justify-end -mt-1">
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-xs font-semibold text-[#4361EE] hover:text-[#3451DE] hover:underline transition-colors"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        className="w-full bg-[#4361EE] hover:bg-[#3451DE]"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <div className="text-center text-sm text-slate-500 pt-2">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Create Account
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
