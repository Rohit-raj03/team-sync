import React, { useRef } from 'react';
import { UploadCloud, Paperclip, FileText, Image, FileCode, Trash2, X } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
    return <Image size={15} className="text-emerald-500" />;
  }
  if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css'].includes(ext)) {
    return <FileCode size={15} className="text-indigo-500" />;
  }
  return <FileText size={15} className="text-blue-500" />;
};

/**
 * Feature Component: TaskAttachmentsUploader
 * Layer: features/tasks/components/
 * Responsibility: Drag-and-drop file attachment uploader with file type badges and deletion.
 */
export const TaskAttachmentsUploader = ({ attachments = [], onChange }) => {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
    }));
    onChange([...attachments, ...newItems]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id, e) => {
    e?.stopPropagation();
    onChange(attachments.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip size={15} className="text-slate-500" />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attachments <span className="text-slate-400 font-normal">({attachments.length})</span>
          </label>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-[#4361EE] hover:bg-indigo-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-[#4361EE] flex items-center justify-center transition-colors">
            <UploadCloud size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              <span className="text-[#4361EE]">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-[10px] text-slate-400">PDF, PNG, JPG, Figma, or ZIP up to 25MB</p>
          </div>
        </div>
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 text-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{file.size}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(file.id, e)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

