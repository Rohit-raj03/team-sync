import React, { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  Paperclip,
  FileText,
  Image,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { taskService } from "../services/task.service.js";
import { showToast } from "../../../shared/utils/toast.js";
import { createSmoothProgressTracker } from "../utils/attachmentProgress.js";

export { createSmoothProgressTracker };

// 5MB maximum file size limit (matching Backend config.MAX_FILE_SIZE_BYTES)
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
];

export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || "B"}`;
};

export const getFileExtension = (filename = "") => {
  return (filename.split(".").pop() || "").toLowerCase();
};

export const isImageFile = (fileOrName, mimeType = "") => {
  if (mimeType && mimeType.startsWith("image/")) return true;
  const name = typeof fileOrName === "string" ? fileOrName : fileOrName?.name || fileOrName?.fileName || "";
  const ext = getFileExtension(name);
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
};

export const getDocumentBadge = (filename = "") => {
  const ext = getFileExtension(filename);
  if (ext === "pdf") {
    return {
      label: "PDF",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      iconColor: "text-rose-500",
    };
  }
  if (["doc", "docx"].includes(ext)) {
    return {
      label: "DOC",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-500",
    };
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-500",
    };
  }
  if (["ppt", "pptx"].includes(ext)) {
    return {
      label: "PPT",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      iconColor: "text-amber-500",
    };
  }
  if (ext === "txt") {
    return {
      label: "TXT",
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      iconColor: "text-slate-500",
    };
  }
  return {
    label: ext.toUpperCase() || "FILE",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconColor: "text-indigo-500",
  };
};

/**
 * Feature Component: TaskAttachmentsUploader
 * Layer: features/tasks/components/
 * Responsibility: End-to-end drag-and-drop & browse attachment uploader with ImageKit integration,
 * instant client-side validation (types and 5MB limit), upload progress, image thumbnails, and safe deletion.
 */
export const TaskAttachmentsUploader = ({
  attachments = [],
  onChange,
  disabled = false,
  taskId = null,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // In-flight uploads: { id, name, size, progress, status, error, previewUrl, fileObj, fileId }
  const [validationError, setValidationError] = useState("");
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Active abort controllers map: key = queueId, value = AbortController
  const activeControllersRef = useRef(new Map());
  // Active smooth progress animation trackers: key = queueId, value = tracker
  const activeProgressTrackersRef = useRef(new Map());

  // Keep fresh reference to attachments to avoid stale closures during concurrent uploads
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  const uploadQueueRef = useRef(uploadQueue);
  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  // Clean up object URLs, smooth progress intervals, and abort pending requests on unmount
  useEffect(() => {
    const controllers = activeControllersRef.current;
    const trackers = activeProgressTrackersRef.current;
    return () => {
      trackers.forEach((tracker) => {
        try {
          tracker.abort();
        } catch {
          // ignore
        }
      });
      trackers.clear();

      controllers.forEach((controller) => {
        try {
          controller.abort();
        } catch {
          // ignore
        }
      });
      controllers.clear();

      uploadQueueRef.current.forEach((item) => {
        if (item.previewUrl) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {
            // ignore
          }
        }
      });
    };
  }, []);

  // Validate an individual file before initiating upload
  const validateFile = (file) => {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File '${file.name}' has an unsupported format (.${ext}). Supported formats: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File '${file.name}' (${formatFileSize(file.size)}) exceeds the 5MB size limit.`;
    }
    return null;
  };

  const isDuplicateFile = (file) => {
    const fileName = file.name.toLowerCase();

    // Check if already in saved attachments
    const inAttachments = (attachmentsRef.current || []).some((att) => {
      const attName = (att.fileName || att.name || "").toLowerCase();
      const attSize = att.fileSize || att.size;
      return attName === fileName && (!attSize || Number(attSize) === file.size);
    });
    if (inAttachments) {
      return `File '${file.name}' is already attached.`;
    }

    // Check if currently in upload queue (and not failed)
    const inQueue = uploadQueue.some((item) => {
      return (
        item.name.toLowerCase() === fileName &&
        item.size === file.size &&
        item.status !== "failed"
      );
    });
    if (inQueue) {
      return `File '${file.name}' is already uploading.`;
    }

    return null;
  };

  const uploadSingleFile = async (queueId, file) => {
    // 1. Abort and clean up any existing controller/tracker for this queueId
    activeControllersRef.current.get(queueId)?.abort();
    activeProgressTrackersRef.current.get(queueId)?.abort();

    const abortController = new AbortController();
    activeControllersRef.current.set(queueId, abortController);

    const formData = new FormData();
    formData.append("files", file);

    // Initial state: uploading at 0%
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === queueId
          ? { ...item, status: "uploading", progress: 0, error: null }
          : item
      )
    );

    // 2. Set up smooth progress tracker loop (runs every 25ms based on file size)
    let onCompletionResolve;
    const completionPromise = new Promise((resolve) => {
      onCompletionResolve = resolve;
    });

    const tracker = createSmoothProgressTracker({
      fileSize: file.size,
      onTick: (progress) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, status: "uploading", progress }
              : item
          )
        );
      },
      onComplete: () => {
        onCompletionResolve?.();
      },
    });

    activeProgressTrackersRef.current.set(queueId, tracker);

    const onUploadProgress = (progressEvent) => {
      tracker.setNetworkProgress(progressEvent.loaded, progressEvent.total);
    };

    try {
      let response;
      if (taskId) {
        // Direct upload to existing task
        response = await taskService.attachFilesToTask(taskId, formData, {
          onUploadProgress,
          signal: abortController.signal,
        });
      } else {
        // Upload to ImageKit via attachments endpoint for Create / Edit Form
        response = await taskService.uploadAttachments(formData, {
          onUploadProgress,
          signal: abortController.signal,
        });
      }

      const uploadedList =
        response?.data ||
        response?.attachments ||
        (Array.isArray(response) ? response : [response]);

      const uploadedAttachment =
        Array.isArray(uploadedList) && uploadedList.length > 0
          ? uploadedList[0]
          : uploadedList;

      const fileId =
        uploadedAttachment?.fileId ||
        uploadedAttachment?._id ||
        uploadedAttachment?.id;

      const fileUrl =
        uploadedAttachment?.fileUrl ||
        uploadedAttachment?.url;

      // Only set the status to "Uploaded" (100%) after the ImageKit API returns a successful response containing the fileId and url
      if (!fileId || !fileUrl) {
        throw new Error("ImageKit upload response missing fileId or url");
      }

      // Signal tracker that upload succeeded, and rapidly animate displayProgress to 100%
      tracker.resolveTarget();

      // Await rapid progress animation to finish reaching 100% before marking completed
      await completionPromise;

      activeProgressTrackersRef.current.delete(queueId);

      // Completed state: stop spinner, mark 100%, and status "completed" (renders as "Uploaded")
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? { ...item, status: "completed", progress: 100, fileId, fileUrl }
            : item
        )
      );

      // Format attachment with fileId saved in state
      const formattedAttachment = {
        fileId,
        fileName:
          uploadedAttachment.fileName ||
          uploadedAttachment.name ||
          file.name,
        fileUrl,
        mimeType:
          uploadedAttachment.mimeType ||
          uploadedAttachment.verifiedMimeType ||
          file.type,
        fileSize: uploadedAttachment.fileSize || file.size,
        thumbnailUrl:
          uploadedAttachment.thumbnailUrl ||
          (isImageFile(file.name, file.type) ? fileUrl : ""),
        fileType:
          uploadedAttachment.fileType ||
          (isImageFile(file.name, file.type) ? "image" : "document"),
        uploadedAt:
          uploadedAttachment.uploadedAt || new Date().toISOString(),
      };

      // Merge newly uploaded attachment into form state
      let nextAttachments;
      if (taskId && Array.isArray(response?.attachments)) {
        nextAttachments = response.attachments;
      } else {
        nextAttachments = [...attachmentsRef.current, formattedAttachment];
      }
      attachmentsRef.current = nextAttachments;
      onChange?.(nextAttachments);
      showToast.attachments.uploadCompleted(1);

      // Hold completed badge briefly (700ms) so user sees "Uploaded successfully" with green checkmark
      setTimeout(() => {
        setUploadQueue((prev) => {
          const target = prev.find((item) => item.id === queueId);
          if (target?.previewUrl) {
            try {
              URL.revokeObjectURL(target.previewUrl);
            } catch {
              // ignore
            }
          }
          return prev.filter((item) => item.id !== queueId);
        });
        activeControllersRef.current.delete(queueId);
      }, 700);
    } catch (err) {
      tracker.abort();
      activeProgressTrackersRef.current.delete(queueId);
      activeControllersRef.current.delete(queueId);

      // User cancelled/aborted the upload
      if (
        err.name === "CanceledError" ||
        err.name === "AbortError" ||
        err.code === "ERR_CANCELED"
      ) {
        setUploadQueue((prev) => {
          const target = prev.find((item) => item.id === queueId);
          if (target?.previewUrl) {
            try {
              URL.revokeObjectURL(target.previewUrl);
            } catch {
              // ignore
            }
          }
          return prev.filter((item) => item.id !== queueId);
        });
        return;
      }

      console.error(`Attachment upload failure for '${file.name}':`, err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to upload attachment";

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? { ...item, status: "failed", error: errMsg, progress: 0 }
            : item
        )
      );
      showToast.attachments.uploadFailed(errMsg);
    }
  };

  const handleFiles = async (selectedFiles) => {
    if (disabled || !selectedFiles || selectedFiles.length === 0) return;
    setValidationError("");

    const filesArray = Array.from(selectedFiles);
    const validFiles = [];
    const rejectedErrors = [];
    const batchSeen = new Set();

    filesArray.forEach((file) => {
      const lowerName = file.name.toLowerCase();
      if (batchSeen.has(lowerName)) {
        rejectedErrors.push(`Duplicate file '${file.name}' in selection.`);
        return;
      }
      batchSeen.add(lowerName);

      const valError = validateFile(file);
      if (valError) {
        rejectedErrors.push(valError);
        return;
      }

      const dupError = isDuplicateFile(file);
      if (dupError) {
        rejectedErrors.push(dupError);
        return;
      }

      validFiles.push(file);
    });

    if (rejectedErrors.length > 0) {
      const errMsg = rejectedErrors.join(" ");
      setValidationError(errMsg);
      showToast.error(errMsg);
    }

    if (validFiles.length === 0) return;

    // Track active uploads in local UI queue starting with pending (0%)
    const queueEntries = validFiles.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending",
      isImage: isImageFile(file.name, file.type),
      previewUrl: isImageFile(file.name, file.type)
        ? URL.createObjectURL(file)
        : null,
      fileObj: file,
      error: null,
    }));

    setUploadQueue((prev) => [...prev, ...queueEntries]);
    showToast.attachments.uploadStarted(validFiles.length);

    // Launch independent uploads concurrently
    queueEntries.forEach((entry) => {
      uploadSingleFile(entry.id, entry.fileObj);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove attachment: if it has an ImageKit fileId, trigger orphan cleanup
  const handleRemoveAttachment = async (fileToRemove, e) => {
    e?.stopPropagation();
    const fileId = fileToRemove.fileId || fileToRemove._id || fileToRemove.id;
    const isImageKitFile =
      fileToRemove.fileId && !String(fileToRemove.fileId).startsWith("temp-");

    // Immediately update UI state
    const nextAttachments = attachments.filter(
      (item) => (item.fileId || item._id || item.id) !== fileId
    );
    attachmentsRef.current = nextAttachments;
    onChange?.(nextAttachments);

    if (isImageKitFile) {
      try {
        if (taskId) {
          await taskService.deleteTaskAttachment(taskId, fileId);
        } else {
          await taskService.deleteImageKitFile(fileToRemove.fileId);
        }
        showToast.attachments.removed();
      } catch (err) {
        console.warn("Could not delete file from ImageKit:", err.message);
      }
    }
  };

  const handleRetryUpload = (tempId, e) => {
    e?.stopPropagation();
    const item = uploadQueue.find((q) => q.id === tempId);
    if (!item || !item.fileObj) return;

    uploadSingleFile(tempId, item.fileObj);
  };

  const handleRemoveQueueItem = (tempId, e) => {
    e?.stopPropagation();
    // 1. Abort network request and smooth progress animation if active
    const tracker = activeProgressTrackersRef.current.get(tempId);
    if (tracker) {
      tracker.abort();
      activeProgressTrackersRef.current.delete(tempId);
    }

    const controller = activeControllersRef.current.get(tempId);
    if (controller) {
      try {
        controller.abort();
      } catch {
        // ignore
      }
      activeControllersRef.current.delete(tempId);
    }

    // 2. Revoke preview URL & remove from queue state
    setUploadQueue((prev) => {
      const target = prev.find((item) => item.id === tempId);
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((item) => item.id !== tempId);
    });
  };

  // Filter out any attachments that are still transitioning in the upload queue
  const queueFileIds = new Set(
    uploadQueue
      .filter((q) => q.status === "completed" && q.fileId)
      .map((q) => q.fileId)
  );

  const displayedAttachments = attachments.filter(
    (item) => !queueFileIds.has(item.fileId || item._id || item.id)
  );

  const totalAttachmentsCount = displayedAttachments.length + uploadQueue.length;

  return (
    <div className="space-y-3">
      {/* Header with Title and Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip size={15} className="text-slate-500" />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attachments{" "}
            <span className="text-slate-400 font-normal">
              ({totalAttachmentsCount})
            </span>
          </label>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Max 5MB each • Images & Docs
        </span>
      </div>

      {/* Validation / Error Banner */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError("")}
            className="text-rose-400 hover:text-rose-700 p-0.5 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all group ${
          isDragging
            ? "border-[#4361EE] bg-indigo-50/40 scale-[1.01]"
            : "border-slate-200 hover:border-[#4361EE] hover:bg-indigo-50/20"
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
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isDragging
                ? "bg-indigo-100 text-[#4361EE]"
                : "bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-[#4361EE]"
            }`}
          >
            <UploadCloud size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              <span className="text-[#4361EE]">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              JPG, PNG, WEBP, GIF, PDF, Word, Excel, PowerPoint, TXT, CSV (Up to 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Queue Progress Items */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => {
            const isFailed = item.status === "failed" || Boolean(item.error);
            const isCompleted = item.status === "completed";
            const isProcessing = item.status === "processing";
            const isUploading = item.status === "uploading";

            return (
              <div
                key={item.id}
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
                      <p
                        className="font-semibold text-xs truncate"
                        title={item.name}
                      >
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
                                onClick={(e) => handleRetryUpload(item.id, e)}
                                className="text-[#4361EE] hover:underline font-bold shrink-0 cursor-pointer"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        ) : isCompleted ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2
                              size={10}
                              className="text-emerald-500 shrink-0"
                            />
                            <span>Uploaded</span>
                          </span>
                        ) : isProcessing ? (
                          <span className="text-[#4361EE] font-medium flex items-center gap-1">
                            <Loader2
                              size={10}
                              className="animate-spin shrink-0"
                            />
                            <span>Processing attachment...</span>
                          </span>
                        ) : isUploading ? (
                          <span className="text-[#4361EE] font-medium flex items-center gap-1">
                            <Loader2
                              size={10}
                              className="animate-spin shrink-0"
                            />
                            <span>
                              Uploading to ImageKit... {item.progress}%
                            </span>
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
                    onClick={(e) => handleRemoveQueueItem(item.id, e)}
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
                        isCompleted ? "bg-emerald-500" : "bg-[#4361EE]"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Attachments List */}
      {displayedAttachments.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {displayedAttachments.map((file, idx) => {
            const fileName = file.fileName || file.name || "Attachment";
            const fileUrl = file.fileUrl || file.url || "";
            const fileId = file.fileId || file.id || `att-${idx}`;
            const isImage = isImageFile(fileName, file.mimeType || file.fileType);
            const badge = getDocumentBadge(fileName);
            const formattedSize = file.size || (file.fileSize ? formatFileSize(file.fileSize) : "");

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
                      onClick={() => setPreviewModalUrl(fileUrl || file.thumbnailUrl)}
                      title="Click to view full preview"
                    >
                      <img
                        src={file.thumbnailUrl || fileUrl}
                        alt={fileName}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 items-center justify-center">
                        <Image size={16} />
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
                      <span className="font-medium text-slate-500 uppercase">{badge.label}</span>
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-indigo-50 transition-colors"
                      title="Open attachment in new tab"
                      aria-label={`Open ${fileName}`}
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveAttachment(file, e)}
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
          })}
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-xl bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[82vh] w-auto rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAttachmentsUploader;