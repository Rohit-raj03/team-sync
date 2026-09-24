import React from 'react';
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
