import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

/**
 * Shared UI Component: Input
 * Layer: shared/components/ui/
 * Features:
 *  - Lucide icon support (Mail, User, Lock, etc.)
 *  - Auto-inferred icons based on type or name (email, password, user/username)
 *  - Password show/hide eye toggle with Lucide Eye / EyeOff
 *  - Clean error states and full accessibility
 */
export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  containerClassName = '',
  id,
  icon: IconProp,
  showPasswordToggle = true,
  rightElement,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name;
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Resolve Icon component or element
  let ResolvedIcon = IconProp;
  if (ResolvedIcon === undefined) {
    if (type === 'email' || props.name === 'email') {
      ResolvedIcon = Mail;
    } else if (isPassword || props.name?.toLowerCase().includes('password')) {
      ResolvedIcon = Lock;
    } else if (
      props.name === 'name' ||
      props.name === 'username' ||
      props.placeholder?.toLowerCase().includes('username')
    ) {
      ResolvedIcon = User;
    }
  }

  const hasLeftIcon = Boolean(ResolvedIcon);
  const hasRightToggle = isPassword && showPasswordToggle;
  const hasRightElement = Boolean(rightElement || hasRightToggle);

  const renderLeftIcon = () => {
    if (!ResolvedIcon) return null;
    if (React.isValidElement(ResolvedIcon)) {
      return ResolvedIcon;
    }
    const IconComponent = ResolvedIcon;
    return <IconComponent size={16} className="text-slate-400" />;
  };

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {hasLeftIcon && (
          <div className="absolute left-3.5 pointer-events-none flex items-center justify-center text-slate-400 z-10">
            {renderLeftIcon()}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          className={`w-full ${
            hasLeftIcon ? 'pl-10' : 'pl-3.5'
          } ${
            hasRightElement ? 'pr-10' : 'pr-3.5'
          } py-2.5 rounded-xl border ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-400'
          } bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />

        {hasRightToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1 flex items-center justify-center cursor-pointer z-10"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : rightElement ? (
          <div className="absolute right-3.5 flex items-center z-10">
            {rightElement}
          </div>
        ) : null}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
