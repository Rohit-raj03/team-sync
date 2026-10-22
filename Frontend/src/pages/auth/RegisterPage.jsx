import React from "react";
import { RegisterForm } from "../../features/auth/components/RegisterForm.jsx";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Team Sync"
            className="w-14 h-14 object-contain mx-auto mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-slate-900">
            Create an account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Start collaborating with your team on Team Sync
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
