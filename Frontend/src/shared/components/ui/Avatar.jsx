import React from 'react';

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
        className={`rounded-full object-cover ${sizes[size] || sizes.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {initials}
    </div>
  );
};
