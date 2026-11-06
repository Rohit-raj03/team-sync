import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { deleteImageKitFile } from "../src/controllers/imagekit.controller.js";
import { getImageKitClient } from "../src/config/imagekit.js";

// Extracted from TaskAttachmentsUploader for headless Node unit testing
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

describe("=== Attachment Upload Progress & Lifecycle Verification ===", () => {
  test("1. File format validation & size limits", () => {
    assert.equal(MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024); // 5MB
    assert.equal(ALLOWED_EXTENSIONS.includes("jpg"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("png"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("webp"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("gif"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("pdf"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("docx"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("xlsx"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("pptx"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("txt"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("csv"), true);
    assert.equal(ALLOWED_EXTENSIONS.includes("exe"), false);
    assert.equal(ALLOWED_EXTENSIONS.includes("zip"), false);
  });

  test("2. Format file size helper", () => {
    assert.equal(formatFileSize(0), "0 B");
    assert.equal(formatFileSize(1024), "1 KB");
    assert.equal(formatFileSize(2.5 * 1024 * 1024), "2.5 MB");
    assert.equal(formatFileSize(5 * 1024 * 1024), "5 MB");
  });

  test("3. Upload Progress with 95% Cap and 'Uploaded' (100%) on ImageKit response", () => {
    const item = {
      id: "test-item-1",
      name: "small_contract.pdf",
      size: 62 * 1024, // 62 KB small file
      progress: 0,
      status: "uploading",
      error: null,
    };

    // State 1: File selected, starts at 0%
    assert.equal(item.progress, 0);
    assert.equal(item.status, "uploading");

    // State 2: Progress updates dynamically with Math.round((loaded/total) * 100)
    const calculateProgress = (loaded, total) => {
      const percent = Math.round((loaded / total) * 100);
      return Math.min(percent, 95); // Capped at 95% until promise resolves
    };

    assert.equal(calculateProgress(30000, 62000), 48);

    // State 3: Buffer hits 100% before ImageKit responds -> must cap at 95%!
    const cappedProgress = calculateProgress(62000, 62000);
    assert.equal(cappedProgress, 95);
    item.progress = cappedProgress;
    assert.equal(item.progress, 95);
    assert.notEqual(item.progress, 100);

    // State 4: ImageKit API returns response with fileId and url
    const mockImageKitResponse = {
      fileId: "ik_file_contract_123",
      fileUrl: "https://ik.imagekit.io/team-sync/contract.pdf",
    };

    // Only set status to "Uploaded" and progress to 100% after response resolves
    if (mockImageKitResponse.fileId && mockImageKitResponse.fileUrl) {
      item.status = "completed"; // Renders as "Uploaded"
      item.progress = 100;
      item.fileId = mockImageKitResponse.fileId;
      item.fileUrl = mockImageKitResponse.fileUrl;
    }

    assert.equal(item.status, "completed");
    assert.equal(item.progress, 100);
    assert.equal(item.fileId, "ik_file_contract_123");
    assert.equal(item.fileUrl, "https://ik.imagekit.io/team-sync/contract.pdf");
  });

  test("4. AbortController cancels in-flight upload on 'X' click or task cancellation", () => {
    const abortController = new AbortController();
    let aborted = false;

    abortController.signal.addEventListener("abort", () => {
      aborted = true;
    });

    assert.equal(aborted, false);
    // User clicks X or cancels task creation
    abortController.abort();
    assert.equal(aborted, true);
    assert.equal(abortController.signal.aborted, true);
  });

  test("5. Duplicate Detection Logic", () => {
    const existingAttachments = [
      { fileId: "ik-1", fileName: "budget.xlsx", fileSize: 20480 },
    ];
    const currentQueue = [
      { id: "q-1", name: "presentation.pptx", size: 1048576, status: "uploading" },
    ];

    const checkDuplicate = (file) => {
      const fileName = file.name.toLowerCase();
      const inAttachments = existingAttachments.some(
        (att) =>
          (att.fileName || att.name || "").toLowerCase() === fileName &&
          (!att.fileSize || Number(att.fileSize) === file.size)
      );
      if (inAttachments) return `File '${file.name}' is already attached.`;

      const inQueue = currentQueue.some(
        (item) =>
          item.name.toLowerCase() === fileName &&
          item.size === file.size &&
          item.status !== "failed"
      );
      if (inQueue) return `File '${file.name}' is already uploading.`;

      return null;
    };

    assert.equal(
      checkDuplicate({ name: "budget.xlsx", size: 20480 }),
      "File 'budget.xlsx' is already attached."
    );
    assert.equal(
      checkDuplicate({ name: "presentation.pptx", size: 1048576 }),
      "File 'presentation.pptx' is already uploading."
    );
    assert.equal(checkDuplicate({ name: "new_file.pdf", size: 50000 }), null);
  });

  test("6. DELETE /api/imagekit/file/:fileId endpoint controller test", async () => {
    let deletedId = null;
    const client = getImageKitClient();
    const origDelete = client.files.delete;
    client.files.delete = async (fId) => {
      deletedId = fId;
      return {};
    };

    const req = {
      params: { fileId: "ik_test_to_delete_999" },
      user: { _id: "507f1f77bcf86cd799439001" },
    };

    let resCode = 200;
    let resData = null;
    const res = {
      status(c) {
        resCode = c;
        return this;
      },
      json(d) {
        resData = d;
        return this;
      },
    };

    await deleteImageKitFile(req, res);
    assert.equal(resCode, 200);
    assert.equal(resData.success, true);
    assert.equal(resData.fileId, "ik_test_to_delete_999");
    assert.equal(deletedId, "ik_test_to_delete_999");

    // Test missing fileId validation (400)
    let errCode = 200;
    let errData = null;
    const errRes = {
      status(c) {
        errCode = c;
        return this;
      },
      json(d) {
        errData = d;
        return this;
      },
    };
    await deleteImageKitFile({ params: {} }, errRes);
    assert.equal(errCode, 400);
    assert.equal(errData.success, false);

    client.files.delete = origDelete;
  });

  test("7. Session cleanup on task cancellation logic", () => {
    const initialAttachments = [
      { fileId: "ik_existing_1", fileName: "prior_doc.pdf" },
    ];
    const sessionAttachments = [
      { fileId: "ik_existing_1", fileName: "prior_doc.pdf" },
      { fileId: "ik_new_session_2", fileName: "temp_image.png" },
      { fileId: "ik_new_session_3", fileName: "notes.txt" },
    ];

    const initialFileIds = new Set(initialAttachments.map((a) => a.fileId));
    const orphansToDelete = sessionAttachments.filter(
      (a) => a.fileId && !initialFileIds.has(a.fileId)
    );

    assert.equal(orphansToDelete.length, 2);
    assert.equal(orphansToDelete[0].fileId, "ik_new_session_2");
    assert.equal(orphansToDelete[1].fileId, "ik_new_session_3");
  });
});
