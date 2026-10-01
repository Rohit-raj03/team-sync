import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${
          sizes[size] || sizes.md
        } ${className}`}
      />
    </div>
  );
};
