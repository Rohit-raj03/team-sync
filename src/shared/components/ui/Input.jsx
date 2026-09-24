import React from 'react';

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
        className={`w-full px-3.5 py-2 rounded-xl border ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-indigo-400'
        } bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
