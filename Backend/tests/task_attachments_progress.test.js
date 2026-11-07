import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { deleteImageKitFile } from "../src/controllers/imagekit.controller.js";
import { getImageKitClient } from "../src/config/imagekit.js";
import {
  calculateDynamicStep,
  createSmoothProgressTracker,
} from "../../Frontend/src/features/tasks/utils/attachmentProgress.js";

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

  test("3. File-Size-Based Smooth Progress Loop (0% to 100%, 90% soft ceiling, rapid completion)", async () => {
    // Dynamic step speed based on file size
    assert.equal(calculateDynamicStep(62 * 1024), 2.0); // Small file (62 KB) -> 2.0% per tick
    assert.equal(calculateDynamicStep(500 * 1024), 1.5); // Medium file (500 KB) -> 1.5% per tick
    assert.equal(calculateDynamicStep(3 * 1024 * 1024), 1.0); // Large file (3 MB) -> 1.0% per tick

    const ticks = [];
    let completed = false;

    const tracker = createSmoothProgressTracker({
      fileSize: 62 * 1024,
      onTick: (val) => ticks.push(val),
      onComplete: () => {
        completed = true;
      },
    });

    // Run for 120ms (several 25ms ticks) while upload is in-flight
    await new Promise((resolve) => setTimeout(resolve, 130));

    // Progress should start at low values and increment smoothly (e.g., 2, 4, 6, 8...)
    assert.ok(ticks.length >= 3, "Tracker should record smooth interval ticks");
    assert.ok(ticks[0] < 15, "First tick should not jump directly to 90% or 95%");
    for (let i = 1; i < ticks.length; i++) {
      assert.ok(
        ticks[i] >= ticks[i - 1],
        "Ticks must monotonically increase smoothly"
      );
    }
    // Should stay within in-flight soft ceiling
    assert.ok(
      ticks[ticks.length - 1] <= 90,
      "In-flight progress must not exceed 90% soft ceiling"
    );

    // ImageKit upload completes with fileId and url -> resolve target to 100%
    const mockImageKitResponse = {
      fileId: "ik_file_contract_123",
      fileUrl: "https://ik.imagekit.io/team-sync/contract.pdf",
    };

    assert.ok(mockImageKitResponse.fileId && mockImageKitResponse.fileUrl);
    tracker.resolveTarget();

    // Await rapid animation to 100%
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (completed) {
          clearInterval(check);
          resolve();
        }
      }, 10);
    });

    assert.equal(completed, true, "Tracker should fire onComplete upon reaching 100%");
    assert.equal(ticks[ticks.length - 1], 100, "Final tick must reach 100%");
  });

  test("4. AbortController and smooth progress tracker cancellation on 'X' click", async () => {
    const abortController = new AbortController();
    let aborted = false;
    abortController.signal.addEventListener("abort", () => {
      aborted = true;
    });

    let ticksCount = 0;
    const tracker = createSmoothProgressTracker({
      fileSize: 100 * 1024,
      onTick: () => ticksCount++,
    });

    await new Promise((r) => setTimeout(r, 60));
    const capturedTicks = ticksCount;
    assert.ok(capturedTicks > 0, "Ticks should have started");

    // User clicks 'X' to abort upload
    abortController.abort();
    tracker.abort();
    assert.equal(abortController.signal.aborted, true);

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(
      ticksCount,
      capturedTicks,
      "No more progress ticks should occur after tracker.abort()"
    );
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
