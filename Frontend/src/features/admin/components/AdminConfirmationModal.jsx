import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

/**
 * Feature Component: AdminConfirmationModal
 * Layer: features/admin/components/
 * Responsibility: Destructive action modal ensuring safety before deleting or deactivating users, projects, or tasks.
 */
export const AdminConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  confirmVariant = 'danger', // 'danger' | 'warning'
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {confirmVariant === 'danger' ? (
                <Trash2 size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldAlert size={14} className="text-slate-400 shrink-0" />
            <span>This action will be logged in the system audit history.</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all active:scale-98 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

