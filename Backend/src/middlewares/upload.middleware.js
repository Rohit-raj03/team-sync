import multer from "multer";
import config from "../config/config.js";

/**
 * Approved MIME types
 */
export const ALLOWED_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Validates actual file content signature (Magic Bytes) from raw buffer
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

// Multer memory storage engine
const storage = multer.memoryStorage();

// Multer client-MIME filter
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
        // Normalize jpeg vs jpg if needed
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

export default {
  ALLOWED_MIME_TYPES,
  detectImageSignature,
  uploadSingleImage,
};

