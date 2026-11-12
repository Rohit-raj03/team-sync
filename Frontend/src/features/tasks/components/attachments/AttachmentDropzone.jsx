import React from "react";
import { UploadCloud } from "lucide-react";

export const AttachmentDropzone = ({
  disabled = false,
  isDragging = false,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  onFilesSelected,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all group ${
        isDragging
          ? "border-primary bg-indigo-50/40 scale-[1.01]"
          : "border-slate-200 hover:border-primary hover:bg-indigo-50/20"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        disabled={disabled}
        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
            e.target.value = "";
          }
        }}
      />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isDragging
              ? "bg-indigo-100 text-primary"
              : "bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-primary"
          }`}
        >
          <UploadCloud size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">
            <span className="text-primary">Click to browse</span> or drag & drop files here
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            JPG, PNG, WEBP, GIF, PDF, Word, Excel, PowerPoint, TXT, CSV (Up to 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttachmentDropzone;
