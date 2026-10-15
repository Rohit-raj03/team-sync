import crypto from "node:crypto";
import path from "node:path";
import { getImageKitClient } from "../config/imagekit.js";

/**
 * Supported root folders for application media
 */
export const MEDIA_FOLDERS = Object.freeze({
  PROFILES: "/profiles",
  TEAMS: "/teams",
  PROJECTS: "/projects",
  ATTACHMENTS: "/attachments",
  GENERAL: "/general",
});

/**
 * Sanitizes and generates a collision-resistant unique filename
 * @param {string} originalName - Original filename from client
 * @param {string} prefix - Optional prefix (e.g. 'avatar', 'logo')
 * @returns {string} Sanitized unique filename
 */
export const generateUniqueFileName = (
  originalName = "image.jpg",
  prefix = "",
) => {
  const extension = (path.extname(originalName) || ".jpg").toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 32);

  const timestamp = Date.now();
  const entropy = crypto.randomBytes(6).toString("hex");
  const cleanPrefix = prefix
    ? `${prefix.replace(/[^a-zA-Z0-9_-]/g, "_")}_`
    : "";

  return `${cleanPrefix}${baseName || "media"}_${timestamp}_${entropy}${extension}`;
};

/**
 * Upload an image buffer to ImageKit
 * @param {Object} options
 * @param {Buffer} options.buffer - Raw image buffer
 * @param {string} options.originalName - Name of original uploaded file
 * @param {string} [options.mimeType] - MIME type of the file
 * @param {string} [options.folder] - Target folder path in ImageKit
 * @param {string[]} [options.tags] - Search tags to attach
 * @param {string} [options.customFileName] - Custom file name override
 * @returns {Promise<{ url: string, fileId: string, name: string, size: number, filePath: string, thumbnailUrl: string }>}
 */
export const uploadImage = async ({
  buffer,
  originalName = "upload.jpg",
  mimeType = "image/jpeg",
  folder = MEDIA_FOLDERS.GENERAL,
  tags = [],
  customFileName = null,
}) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error(
      "Invalid file buffer: buffer is required and must be a Buffer instance",
    );
  }

  const client = getImageKitClient();
  const fileName = customFileName || generateUniqueFileName(originalName);

  // Convert buffer to base64 data string supported across all ImageKit SDK versions
  const base64File = buffer.toString("base64");

  try {
    const uploadParams = {
      file: base64File,
      fileName,
      folder,
      tags: Array.isArray(tags) ? tags : [tags],
      useUniqueFileName: false, // We ensure cryptographic uniqueness ourselves
    };

    const response = await client.files.upload(uploadParams);

    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      size: response.size,
      filePath: response.filePath,
      thumbnailUrl: response.thumbnailUrl || response.url,
      height: response.height,
      width: response.width,
    };
  } catch (error) {
    console.error("❌ ImageKit Upload Failure:", error?.message || error);
    const customError = new Error(
      `ImageKit upload failed: ${error?.message || "Internal third-party media error"}`,
    );
    customError.statusCode = error?.status || error?.statusCode || 502;
    customError.originalError = error;
    throw customError;
  }
};

/**
 * Delete a media file from ImageKit using its fileId
 * Idempotent: Does not throw if the file has already been deleted
 * @param {string} fileId - ImageKit unique file ID
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteImage = async (fileId) => {
  if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
    return {
      success: true,
      message: "No fileId provided, deletion skipped",
    };
  }

  const client = getImageKitClient();

  try {
    await client.files.delete(fileId.trim());
    return {
      success: true,
      message: "File deleted successfully from ImageKit",
    };
  } catch (error) {
    // Treat 404 Not Found as idempotent success (already deleted)
    if (
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.name === "NotFoundError"
    ) {
      console.warn(
        `ℹ️ ImageKit fileId ${fileId} was already deleted or not found.`,
      );
      return {
        success: true,
        message: "File was already deleted or not found in ImageKit",
      };
    }

    console.error(
      `❌ Failed to delete ImageKit fileId [${fileId}]:`,
      error?.message || error,
    );
    const deleteError = new Error(
      `ImageKit deletion failed for fileId ${fileId}: ${error?.message || "Unknown error"}`,
    );
    deleteError.statusCode = error?.status || error?.statusCode || 502;
    throw deleteError;
  }
};

/**
 * Fire-and-forget safe cleanup helper
 * Never throws an unhandled rejection, useful for orphan rollback or background cleanup
 * @param {string} fileId
 */
export const safeCleanupFile = async (fileId) => {
  if (!fileId) return;
  try {
    await deleteImage(fileId);
  } catch (err) {
    console.warn(
      `⚠️ [Cleanup Failed]: Unable to clean up ImageKit file [${fileId}]:`,
      err?.message,
    );
  }
};

export default {
  MEDIA_FOLDERS,
  generateUniqueFileName,
  uploadImage,
  deleteImage,
  safeCleanupFile,
};
