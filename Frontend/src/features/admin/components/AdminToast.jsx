import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Feature Component: AdminToast
 * Layer: features/admin/components/
 * Responsibility: Toast notification alert for administrative actions (creation, deletion, status toggles).
 */
export const AdminToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100 shadow-emerald-950/20'
            : isError
            ? 'bg-rose-950/90 border-rose-800 text-rose-100 shadow-rose-950/20'
            : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        ) : isError ? (
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
        ) : (
          <Info size={16} className="text-blue-400 shrink-0" />
        )}

        <span className="max-w-xs">{toast.message}</span>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

