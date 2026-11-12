import React from "react";
import { X } from "lucide-react";

export const AttachmentPreviewModal = ({ previewUrl, onClose }) => {
  if (!previewUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-xl bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
          aria-label="Close preview"
        >
          <X size={18} />
        </button>
        <img
          src={previewUrl}
          alt="Attachment Preview"
          className="max-h-[82vh] w-auto rounded-xl object-contain mx-auto"
        />
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;
