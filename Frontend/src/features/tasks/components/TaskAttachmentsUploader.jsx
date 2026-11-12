import React, { useRef, useState, useEffect } from "react";
import { Paperclip, AlertCircle, X } from "lucide-react";
import { taskService } from "../services/task.service.js";
import { showToast } from "../../../shared/utils/toast.js";
import { createSmoothProgressTracker } from "../utils/attachmentProgress.js";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
  formatFileSize,
  getFileExtension,
  isImageFile,
} from "../utils/attachmentHelpers.js";
import { AttachmentDropzone } from "./attachments/AttachmentDropzone.jsx";
import { AttachmentQueueItem } from "./attachments/AttachmentQueueItem.jsx";
import { AttachmentItem } from "./attachments/AttachmentItem.jsx";
import { AttachmentPreviewModal } from "./attachments/AttachmentPreviewModal.jsx";

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
            className="text-rose-400 hover:text-rose-700 p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drag & Drop Area */}
      <AttachmentDropzone
        disabled={disabled}
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        fileInputRef={fileInputRef}
        onFilesSelected={handleFiles}
      />

      {/* Uploading Queue Progress Items */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => (
            <AttachmentQueueItem
              key={item.id}
              item={item}
              onRetry={handleRetryUpload}
              onRemove={handleRemoveQueueItem}
            />
          ))}
        </div>
      )}

      {/* Completed Attachments List */}
      {displayedAttachments.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {displayedAttachments.map((file, idx) => (
            <AttachmentItem
              key={file.fileId || file.id || file._id || `att-${idx}`}
              file={file}
              disabled={disabled}
              onPreview={setPreviewModalUrl}
              onRemove={handleRemoveAttachment}
            />
          ))}
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      <AttachmentPreviewModal
        previewUrl={previewModalUrl}
        onClose={() => setPreviewModalUrl(null)}
      />
    </div>
  );
};

export default TaskAttachmentsUploader;
