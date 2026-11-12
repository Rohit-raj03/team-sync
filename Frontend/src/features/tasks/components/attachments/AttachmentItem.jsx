import React from "react";
import {
  Image as ImageIcon,
  Eye,
  FileText,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  formatFileSize,
  isImageFile,
  getDocumentBadge,
} from "../../utils/attachmentHelpers.js";

export const AttachmentItem = ({
  file,
  disabled = false,
  onPreview,
  onRemove,
}) => {
  const fileName = file.fileName || file.name || "Attachment";
  const fileUrl = file.fileUrl || file.url || "";
  const fileId = file.fileId || file.id || file._id;
  const isImage = isImageFile(fileName, file.mimeType || file.fileType);
  const badge = getDocumentBadge(fileName);
  const formattedSize =
    file.size || (file.fileSize ? formatFileSize(file.fileSize) : "");

  return (
    <div
      key={fileId}
      className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs hover:border-slate-300 hover:bg-slate-50 transition-all group"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Thumbnail / Badge */}
        {isImage && (file.thumbnailUrl || fileUrl) ? (
          <div
            className="relative cursor-pointer group/thumb shrink-0"
            onClick={() => onPreview?.(fileUrl || file.thumbnailUrl)}
            title="Click to view full preview"
          >
            <img
              src={file.thumbnailUrl || fileUrl}
              alt={fileName}
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = "flex";
                }
              }}
            />
            <div className="hidden w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 items-center justify-center">
              <ImageIcon size={16} />
            </div>
            <div className="absolute inset-0 bg-slate-900/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Eye size={12} />
            </div>
          </div>
        ) : (
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${badge.bg}`}
          >
            <FileText size={16} className={badge.iconColor} />
          </div>
        )}

        {/* File Metadata */}
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-semibold text-slate-800 truncate"
            title={fileName}
          >
            {fileName}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-500 uppercase">
              {badge.label}
            </span>
            {formattedSize && (
              <>
                <span>•</span>
                <span>{formattedSize}</span>
              </>
            )}
            <span>•</span>
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <CheckCircle2 size={10} />
              Uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-colors"
            title="Open attachment in new tab"
            aria-label={`Open ${fileName}`}
          >
            <ExternalLink size={13} />
          </a>
        )}

        {!disabled && (
          <button
            type="button"
            onClick={(e) => onRemove(file, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title={`Remove ${fileName}`}
            aria-label={`Remove ${fileName}`}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttachmentItem;
