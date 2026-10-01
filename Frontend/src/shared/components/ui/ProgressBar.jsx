import React from 'react';

/**
 * Shared UI Component: ProgressBar
 * Layer: shared/components/ui/
 * Responsibility: Renders a smooth animated progress bar with pill styling and gradient fills.
 */
export const ProgressBar = ({
  progress = 0,
  color = 'indigo',
  height = 'h-2',
  className = '',
  showLabel = false,
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const colors = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-blue-600',
    cyan: 'bg-gradient-to-r from-cyan-400 to-teal-500',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-semibold">
          <span>Progress</span>
          <span>{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${colors[color] || colors.indigo} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

