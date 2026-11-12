import React from "react";
import { FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { formatFileSize } from "../../utils/attachmentHelpers.js";

export const AttachmentQueueItem = ({ item, onRetry, onRemove }) => {
  const isFailed = item.status === "failed" || Boolean(item.error);
  const isCompleted = item.status === "completed";
  const isProcessing = item.status === "processing";
  const isUploading = item.status === "uploading";

  return (
    <div
      className={`p-2.5 rounded-xl border text-xs transition-all ${
        isFailed
          ? "bg-rose-50/70 border-rose-200 text-rose-900"
          : "bg-indigo-50/50 border-indigo-100 text-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Thumbnail / Icon */}
          {item.isImage && item.previewUrl ? (
            <img
              src={item.previewUrl}
              alt={item.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-200 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-500 shrink-0">
              <FileText size={16} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs truncate" title={item.name}>
              {item.name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>{formatFileSize(item.size)}</span>
              <span>•</span>
              {isFailed ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-600 font-semibold truncate">
                    {item.error || "Upload failed"}
                  </span>
                  {item.fileObj && (
                    <button
                      type="button"
                      onClick={(e) => onRetry(item.id, e)}
                      className="text-primary hover:underline font-bold shrink-0 cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : isCompleted ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                  <span>Uploaded</span>
                </span>
              ) : isProcessing ? (
                <span className="text-primary font-medium flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin shrink-0" />
                  <span>Processing attachment...</span>
                </span>
              ) : isUploading ? (
                <span className="text-primary font-medium flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin shrink-0" />
                  <span>Uploading to ImageKit... {item.progress}%</span>
                </span>
              ) : (
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Loader2
                    size={10}
                    className="animate-spin text-slate-400 shrink-0"
                  />
                  <span>Waiting to upload...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => onRemove(item.id, e)}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 transition-colors shrink-0 cursor-pointer"
          aria-label={`Cancel ${item.name}`}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      {!isFailed && (
        <div className="mt-2 w-full bg-indigo-100 rounded-full h-1 overflow-hidden">
          <div
            className={`h-1 rounded-full transition-all duration-200 ${
              isCompleted ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default AttachmentQueueItem;
