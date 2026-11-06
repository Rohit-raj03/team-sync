import multer from "multer";
import config from "../config/config.js";

/**
 * Approved MIME types for standalone avatar/cover/logo images
 */
export const ALLOWED_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * Approved MIME types for Task Attachments (Images & Documents)
 */
export const ALLOWED_ATTACHMENT_MIME_TYPES = Object.freeze([
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  // Documents
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "text/csv", // .csv
  "application/csv",
  "text/comma-separated-values",
  "application/octet-stream", // Fallback MIME that will be validated against magic bytes
]);

export const ALLOWED_ATTACHMENT_EXTENSIONS = Object.freeze([
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
]);

/**
 * Validates actual file content signature (Magic Bytes) from raw buffer for images
 * Prevents file extension / MIME-type spoofing
 * @param {Buffer} buffer - File buffer
 * @returns {string|null} Detected MIME type or null if invalid
 */
export const detectImageSignature = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) {
    return null;
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // 3. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46; // 'RIFF'
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50; // 'WEBP'

  if (isRiff && isWebp) {
    return "image/webp";
  }

  return null;
};

/**
 * Detects and verifies file signature (Magic Bytes) for all supported attachment types:
 * Images (JPG, PNG, WebP, GIF) & Documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV)
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename with extension
 * @param {string} declaredMime - Declared client MIME type
 * @returns {string|null} Verified MIME type or null if content signature is invalid/unsupported
 */
export const detectAttachmentSignature = (
  buffer,
  originalName = "",
  declaredMime = ""
) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
    return null;
  }

  const ext = (originalName.split(".").pop() || "").toLowerCase();

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // 3. GIF: 47 49 46 38 ('GIF87a' or 'GIF89a')
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  // 4. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (buffer.length >= 12) {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    if (isRiff && isWebp) {
      return "image/webp";
    }
  }

  // 5. PDF: %PDF (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf";
  }

  // 6. Office Open XML / ZIP (PK..): 50 4B 03 04, 50 4B 05 06, 50 4B 07 08
  const isZip =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

  if (isZip) {
    if (ext === "docx") {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (ext === "xlsx") {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (ext === "pptx") {
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    // Reject arbitrary ZIP archives not matching supported Office formats
    return null;
  }

  // 7. Compound File Binary Format (CFBF / OLE2): D0 CF 11 E0 A1 B1 1A E1 (.doc, .xls, .ppt)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  ) {
    if (ext === "doc") return "application/msword";
    if (ext === "xls") return "application/vnd.ms-excel";
    if (ext === "ppt") return "application/vnd.ms-powerpoint";
    return null;
  }

  // 8. Plain Text & CSV Validation
  if (ext === "txt" || ext === "csv") {
    // Prevent executable masquerading (e.g. Windows PE 'MZ', Linux ELF, Mach-O)
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) return null; // MZ
    if (
      buffer[0] === 0x7f &&
      buffer[1] === 0x45 &&
      buffer[2] === 0x4c &&
      buffer[3] === 0x46
    ) {
      return null; // ELF
    }
    // Check for null bytes in initial sample indicative of compiled binaries
    const sampleSize = Math.min(buffer.length, 512);
    let nullBytes = 0;
    for (let i = 0; i < sampleSize; i++) {
      if (buffer[i] === 0x00) nullBytes++;
    }
    if (nullBytes > 1) {
      return null;
    }

    return ext === "csv" ? "text/csv" : "text/plain";
  }

  return null;
};

/**
 * Determines categorical fileType for frontend classification
 * @param {string} mimeType
 * @param {string} originalName
 * @returns {"image"|"document"|"pdf"|"spreadsheet"|"presentation"|"text"}
 */
export const getAttachmentFileType = (mimeType = "", originalName = "") => {
  if (mimeType.startsWith("image/")) return "image";
  const ext = (originalName.split(".").pop() || "").toLowerCase();
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (
    ["xls", "xlsx", "csv"].includes(ext) ||
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("csv")
  ) {
    return "spreadsheet";
  }
  if (
    ["ppt", "pptx"].includes(ext) ||
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation")
  ) {
    return "presentation";
  }
  if (["doc", "docx"].includes(ext) || mimeType.includes("word")) {
    return "document";
  }
  if (ext === "txt" || mimeType === "text/plain") {
    return "text";
  }
  return "document";
};

// Multer memory storage engine
const storage = multer.memoryStorage();

// Multer client-MIME filter for images
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file format: ${file.mimetype}. Only JPEG, PNG, and WebP are accepted.`
    );
    error.code = "INVALID_FILE_TYPE";
    cb(error, false);
  }
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES, // Default: 5MB
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware factory for single image upload with rigorous validation:
 * 1. Multer memory capture & file size enforcement
 * 2. Magic byte file signature verification
 * @param {string} [fieldName='image'] - The form field name for multipart upload
 * @param {boolean} [required=true] - Whether missing file is an immediate error
 */
export const uploadSingleImage = (fieldName = "image", required = true) => {
  const upload = multerInstance.single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      // 1. Handle Multer-specific errors
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          const maxMb = (config.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            success: false,
            message: `File size limit exceeded. Maximum allowed size is ${maxMb}MB.`,
          });
        }
        if (err.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      }

      // 2. Check if file is provided when required
      if (!req.file) {
        if (required) {
          return res.status(400).json({
            success: false,
            message: `Missing required file. Please provide an image using field name '${fieldName}'.`,
          });
        }
        return next();
      }

      // 3. Inspect deep file signature (Magic Bytes)
      const detectedType = detectImageSignature(req.file.buffer);

      if (!detectedType) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file content. The file signature does not match an authentic JPEG, PNG, or WebP image.",
        });
      }

      // Check for MIME-type mismatch spoofing
      if (detectedType !== req.file.mimetype) {
        const isJpegMismatch =
          (detectedType === "image/jpeg" && req.file.mimetype === "image/jpg") ||
          (detectedType === "image/jpeg" && req.file.mimetype === "image/jpeg");

        if (!isJpegMismatch) {
          return res.status(400).json({
            success: false,
            message: `File spoofing detected: header states '${req.file.mimetype}' but file signature is '${detectedType}'.`,
          });
        }
      }

      // Attach detected verified type
      req.file.verifiedMimeType = detectedType;

      next();
    });
  };
};

// Multer instance for Task Attachments (allows up to 10 files per batch, max 5MB each)
const attachmentsMulter = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES, // Default: 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    const isAllowedExt = ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext);
    const isAllowedMime =
      ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype) ||
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("text/") ||
      file.mimetype === "application/octet-stream";

    if (isAllowedExt || isAllowedMime) {
      cb(null, true);
    } else {
      const error = new Error(
        `Unsupported file type: '${ext}'. Supported formats: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.`
      );
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  },
});

/**
 * Middleware for task file attachments:
 * Accepts multiple files or single file via 'files', 'file', 'attachments', or 'attachment'.
 * Performs magic-byte inspection and file-size enforcement.
 * @param {boolean} [required=true]
 */
export const uploadAttachments = (required = true) => {
  const upload = attachmentsMulter.any();

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          const maxMb = (config.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            success: false,
            message: `File size limit exceeded. Maximum allowed size is ${maxMb}MB per file.`,
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Cannot upload more than 10 attachments at once.",
          });
        }
        if (err.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      }

      // Consolidate files from req.files or req.file
      const filesList = [];
      if (Array.isArray(req.files)) {
        filesList.push(...req.files);
      } else if (req.files && typeof req.files === "object") {
        Object.values(req.files).forEach((val) => {
          if (Array.isArray(val)) filesList.push(...val);
          else if (val) filesList.push(val);
        });
      }
      if (req.file) {
        filesList.push(req.file);
      }

      if (filesList.length === 0) {
        if (required) {
          return res.status(400).json({
            success: false,
            message: "No files provided. Please upload files using field name 'files' or 'file'.",
          });
        }
        req.uploadedAttachments = [];
        return next();
      }

      // Validate each file with magic byte detection and extension checks
      const validatedFiles = [];
      for (const file of filesList) {
        const ext = (file.originalname.split(".").pop() || "").toLowerCase();

        if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: `Unsupported file extension '.${ext}' for '${file.originalname}'. Supported: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.`,
          });
        }

        const verifiedMime = detectAttachmentSignature(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        if (!verifiedMime) {
          return res.status(400).json({
            success: false,
            message: `Invalid file content in '${file.originalname}'. The file signature does not match an authentic ${ext.toUpperCase()} file.`,
          });
        }

        file.verifiedMimeType = verifiedMime;
        file.fileCategory = getAttachmentFileType(verifiedMime, file.originalname);
        validatedFiles.push(file);
      }

      req.uploadedAttachments = validatedFiles;
      next();
    });
  };
};

export default {
  ALLOWED_MIME_TYPES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  detectImageSignature,
  detectAttachmentSignature,
  getAttachmentFileType,
  uploadSingleImage,
  uploadAttachments,
};
