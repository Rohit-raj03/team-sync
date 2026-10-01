import React from "react";
import { X, FolderPlus } from "lucide-react";
import { ProjectForm } from "./ProjectForm.jsx";

/**
 * Feature Component: CreateProjectModal
 * Layer: features/projects/components/
 * Responsibility: Modal dialog container for creating new initiatives with tagged team members and timeline targets.
 */
export const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create New Project
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Set milestones, tag contributing team members, and connect
                future tasks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <ProjectForm
            onSubmit={(data) => {
              onSubmit?.(data);
              onClose?.();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
