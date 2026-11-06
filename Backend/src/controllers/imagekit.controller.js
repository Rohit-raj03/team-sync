import { getImageKitClient } from "../config/imagekit.js";
import config from "../config/config.js";
import { deleteImage } from "../services/imagekit.service.js";

/**
 * Delete a file directly from ImageKit using SDK or REST API
 * @param {string} fileId
 */
export const deleteFileFromImageKitApi = async (fileId) => {
  const cleanId = String(fileId).trim();
  const client = getImageKitClient();

  // 1. Try ImageKit Node.js SDK
  try {
    if (client && typeof client.deleteFile === "function") {
      await client.deleteFile(cleanId);
      return {
        success: true,
        message: "File deleted successfully from ImageKit",
        fileId: cleanId,
      };
    }
    if (client?.files && typeof client.files.delete === "function") {
      await client.files.delete(cleanId);
      return {
        success: true,
        message: "File deleted successfully from ImageKit",
        fileId: cleanId,
      };
    }
    if (typeof deleteImage === "function") {
      const res = await deleteImage(cleanId);
      return {
        success: true,
        message: res.message || "File deleted successfully from ImageKit",
        fileId: cleanId,
      };
    }
  } catch (sdkError) {
    // Treat 404 as idempotent success (already deleted)
    const status = sdkError?.status || sdkError?.statusCode || 500;
    if (
      status === 404 ||
      sdkError?.name === "NotFoundError" ||
      sdkError?.message?.includes("not found")
    ) {
      return {
        success: true,
        message: "File was already deleted or not found on ImageKit",
        fileId: cleanId,
      };
    }
    // If SDK call failed for reasons other than 404, attempt direct REST API fallback below
    console.warn(
      `ImageKit SDK deletion failed for ${cleanId}, trying REST API fallback:`,
      sdkError.message
    );
  }

  // 2. Direct ImageKit REST API Fallback with Private Key
  if (config.IMAGEKIT_PRIVATE_KEY) {
    const authHeader = `Basic ${Buffer.from(
      config.IMAGEKIT_PRIVATE_KEY + ":"
    ).toString("base64")}`;

    const response = await fetch(
      `https://api.imagekit.io/v1/files/${encodeURIComponent(cleanId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.ok || response.status === 404) {
      return {
        success: true,
        message: "File deleted successfully from ImageKit",
        fileId: cleanId,
      };
    }

    const errData = await response.json().catch(() => ({}));
    const err = new Error(
      errData?.message ||
        `ImageKit REST API delete failed with status ${response.status}`
    );
    err.statusCode = response.status;
    throw err;
  }

  throw new Error("ImageKit SDK or Private Key is not configured on the backend");
};

/**
 * @desc    Delete a file from ImageKit by fileId
 * @route   DELETE /api/imagekit/file/:fileId
 * @access  Private / Authenticated
 */
export const deleteImageKitFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId || typeof fileId !== "string" || !fileId.trim()) {
      return res.status(400).json({
        success: false,
        message: "File ID parameter is required",
      });
    }

    const result = await deleteFileFromImageKitApi(fileId);

    return res.status(200).json({
      success: true,
      message: result.message || "File deleted successfully from ImageKit",
      fileId: result.fileId || fileId.trim(),
    });
  } catch (error) {
    console.error("deleteImageKitFile error:", error.message || error);
    const statusCode = error.statusCode || error.status || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete file from ImageKit",
    });
  }
};

export default {
  deleteFileFromImageKitApi,
  deleteImageKitFile,
};

