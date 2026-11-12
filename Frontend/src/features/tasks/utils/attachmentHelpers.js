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
  const name =
    typeof fileOrName === "string"
      ? fileOrName
      : fileOrName?.name || fileOrName?.fileName || "";
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
