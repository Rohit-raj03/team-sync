import React from "react";
import { FolderOpen } from "lucide-react";

/**
 * Shared UI Component: EmptyState
 * Reusable clean empty state card with icon, title, description, and action button.
 */
export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "Get started by creating your first item.",
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-400">
        <Icon size={24} />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
