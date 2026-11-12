import React from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal.jsx';

/**
 * Shared UI Component: ConfirmationModal
 * Layer: shared/components/ui/
 * Responsibility: Destructive and warning confirmation dialogs with audit notice and keyboard accessibility.
 */
export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning'
  isLoading = false,
  onConfirm,
  onClose,
  showAuditNotice = true,
  auditMessage = 'This action will be logged in the system audit history.',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      maxWidth="max-w-md"
      bodyClassName="p-6 space-y-4"
    >
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

      {showAuditNotice && (
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldAlert size={14} className="text-slate-400 shrink-0" />
          <span>{auditMessage}</span>
        </div>
      )}

      <div className="pt-2 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            await onConfirm?.();
            onClose?.();
          }}
          className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50 ${
            confirmVariant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
