import React, { useState, useEffect } from 'react';

/**
 * Shared UI Component: Avatar
 * Layer: shared/components/ui/
 * Responsibility: Renders user profile picture, or the first letter of the user's name as an avatar fallback.
 */
export const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  // Requirement: If no profile image exists, display the first letter of the user's name
  const firstLetter = (name && name.trim().length > 0)
    ? name.trim().charAt(0).toUpperCase()
    : 'U';

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`rounded-full object-cover shrink-0 ${sizes[size] || sizes.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-indigo-100 text-primary font-bold flex items-center justify-center shrink-0 select-none ${
        sizes[size] || sizes.md
      } ${className}`}
      title={name}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
