import React, { useState } from "react";
import {
  Paperclip,
  Plus,
  Image as ImageIcon,
  FileText,
  Eye,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { TaskAttachmentsUploader } from "../TaskAttachmentsUploader.jsx";
import {
  formatFileSize,
  isImageFile,
  getDocumentBadge,
} from "../../utils/attachmentHelpers.js";

export const TaskAttachmentsSection = ({
  taskId,
  attachments = [],
  canAttachFiles = false,
  canRemoveAttachment,
  onAttachmentsChange,
  onRemoveAttachment,
  onPreview,
  removingAttachmentId = null,
}) => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip size={15} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Attachments ({attachments.length})
          </span>
        </div>

        {canAttachFiles && (
          <button
            type="button"
            onClick={() => setIsUploaderOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>
              {isUploaderOpen ? "Close Uploader" : "Add Attachments"}
            </span>
          </button>
        )}
      </div>

      {/* Inline Attachment Uploader for Direct Uploads to this Task */}
      {isUploaderOpen && (
        <div className="p-3.5 bg-white rounded-2xl border border-indigo-100 shadow-xs animate-in fade-in duration-150">
          <TaskAttachmentsUploader
            taskId={taskId}
            attachments={attachments}
            onChange={onAttachmentsChange}
          />
        </div>
      )}

      {/* Attachments Cards Grid */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attachments.map((file, idx) => {
            const fileName = file.fileName || file.name || "Attachment";
            const fileUrl = file.fileUrl || file.url || "";
            const fileId = file.fileId || file._id || file.id || `att-${idx}`;
            const isImage = isImageFile(
              fileName,
              file.mimeType || file.fileType
            );
            const badge = getDocumentBadge(fileName);
            const formattedSize =
              file.size ||
              (file.fileSize ? formatFileSize(file.fileSize) : "");
            const isRemoving = removingAttachmentId === fileId;
            const canRemove = canRemoveAttachment?.(file);

            return (
              <div
                key={fileId}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Thumbnail / File Icon */}
                  {isImage && (file.thumbnailUrl || fileUrl) ? (
                    <div
                      className="relative cursor-pointer group/thumb shrink-0"
                      onClick={() => onPreview?.(fileUrl || file.thumbnailUrl)}
                      title="Click to view full preview"
                    >
                      <img
                        src={file.thumbnailUrl || fileUrl}
                        alt={fileName}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                      <div className="hidden w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 items-center justify-center">
                        <ImageIcon size={18} />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye size={13} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${badge.bg}`}
                    >
                      <FileText size={18} className={badge.iconColor} />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold text-slate-800 truncate"
                      title={fileName}
                    >
                      {fileName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-500 uppercase">
                        {badge.label}
                      </span>
                      {formattedSize && (
                        <>
                          <span>•</span>
                          <span>{formattedSize}</span>
                        </>
                      )}
                      {file.uploadedBy?.name && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            by {file.uploadedBy.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Open & Remove */}
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

                  {canRemove && (
                    <button
                      type="button"
                      onClick={(e) => onRemoveAttachment?.(file, e)}
                      disabled={isRemoving}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title={`Remove ${fileName}`}
                      aria-label={`Remove ${fileName}`}
                    >
                      {isRemoving ? (
                        <Loader2
                          size={13}
                          className="animate-spin text-rose-500"
                        />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isUploaderOpen && (
          <div className="p-4 bg-white rounded-xl text-center border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">
              No attachments uploaded for this task.
            </p>
            {canAttachFiles && (
              <button
                type="button"
                onClick={() => setIsUploaderOpen(true)}
                className="text-xs font-bold text-primary hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Attach resources now</span>
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default TaskAttachmentsSection;
