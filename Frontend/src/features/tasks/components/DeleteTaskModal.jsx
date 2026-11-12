import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal.jsx";

/**
 * Feature Component: DeleteTaskModal
 * Layer: features/tasks/components/
 * Responsibility: Secure task deletion confirmation modal with mandatory deletion reason,
 * character limits, input validation, and destructive action safeguards.
 * Wraps canonical Modal.
 */
export const DeleteTaskModal = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle = "this task",
  isDeleting = false,
  apiError = "",
}) => {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setTouched(false);
      setLocalError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length > 0 && trimmedReason.length <= 500;

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    if (touched) {
      if (!val.trim()) {
        setLocalError("A reason for deletion is mandatory.");
      } else if (val.trim().length > 500) {
        setLocalError("Reason cannot exceed 500 characters.");
      } else {
        setLocalError("");
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!reason.trim()) {
      setLocalError("A reason for deletion is mandatory.");
    } else if (reason.trim().length > 500) {
      setLocalError("Reason cannot exceed 500 characters.");
    } else {
      setLocalError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!reason.trim()) {
      setLocalError("A reason for deletion is mandatory.");
      return;
    }

    if (reason.trim().length > 500) {
      setLocalError("Reason cannot exceed 500 characters.");
      return;
    }

    setLocalError("");
    await onConfirm?.(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Delete Task?"
      subtitle="Permanent and irreversible action"
      headerClassName="bg-rose-50/40"
      bodyClassName="p-6 space-y-4.5"
      icon={
        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
          <Trash2 size={20} />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4.5">
        {/* Warning Message */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle size={17} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            You are about to delete{" "}
            <span className="font-bold text-slate-900">"{taskTitle}"</span>.
            This action cannot be undone and will permanently remove all
            associated subtasks and discussions.
          </div>
        </div>

        {/* Server API Error Banner */}
        {apiError && (
          <div className="p-3 rounded-2xl bg-rose-100/80 border border-rose-300 text-xs font-semibold text-rose-900 animate-in fade-in">
            {apiError}
          </div>
        )}

        {/* Reason Input Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="deletion-reason"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Reason for deletion <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-semibold ${
                reason.length > 500 ? "text-rose-600" : "text-slate-400"
              }`}
            >
              {reason.length}/500
            </span>
          </div>

          <textarea
            id="deletion-reason"
            rows={4}
            maxLength={600}
            placeholder="Explain why this task needs to be deleted..."
            value={reason}
            onChange={handleReasonChange}
            onBlur={handleBlur}
            disabled={isDeleting}
            className={`w-full p-3.5 rounded-2xl border text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 transition-all resize-none shadow-2xs ${
              localError || (touched && !isValid)
                ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
            }`}
          />

          {(localError || (touched && !isValid)) && (
            <p className="text-[11px] text-rose-600 font-medium">
              {localError || "A valid reason for deletion is mandatory."}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid || isDeleting}
            className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting Task...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteTaskModal;
