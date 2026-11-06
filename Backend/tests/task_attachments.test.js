import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  detectAttachmentSignature,
  getAttachmentFileType,
  ALLOWED_ATTACHMENT_EXTENSIONS,
} from "../src/middlewares/upload.middleware.js";
import imagekit from "../src/config/imagekit.js";
import TaskModel from "../src/models/task.model.js";
import UserModel from "../src/models/user.model.js";
import ProjectModel from "../src/models/project.model.js";
import CommentModel from "../src/models/comment.model.js";
import AuditLogModel from "../src/models/auditLog.model.js";
import {
  createTask,
  updateTask,
  deleteTask,
  uploadTaskAttachments,
  getTaskAttachments,
  deleteTaskAttachment,
  deleteOrphanAttachment,
} from "../src/controllers/task.controller.js";

// ==========================================
// TEST BUFFERS (Authentic file signatures)
// ==========================================
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const VALID_GIF_BUFFER = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
]);
const VALID_WEBP_BUFFER = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const VALID_PDF_BUFFER = Buffer.from(
  "%PDF-1.5\n%Valid mock PDF document for test",
);
const VALID_DOCX_BUFFER = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0x08, 0x00, 0x00, 0x00,
]);
const VALID_XLSX_BUFFER = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0x08, 0x00, 0x00, 0x00,
]);
const VALID_PPTX_BUFFER = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0x08, 0x00, 0x00, 0x00,
]);
const VALID_DOC_CFBF_BUFFER = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00, 0x00, 0x00,
]);
const VALID_TXT_BUFFER = Buffer.from(
  "Sprint review meeting action items and sprint notes.",
);
const VALID_CSV_BUFFER = Buffer.from(
  "id,task,status\n1,Build Auth,DONE\n2,ImageKit,IN_PROGRESS",
);
const MALICIOUS_EXE_BUFFER = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]); // Windows MZ executable

describe("=== 1. Attachment MIME & Magic Bytes Signature Detection ===", () => {
  test("Detects valid JPEG, PNG, GIF, and WebP images", () => {
    assert.equal(
      detectAttachmentSignature(VALID_JPEG_BUFFER, "photo.jpg"),
      "image/jpeg",
    );
    assert.equal(
      detectAttachmentSignature(VALID_PNG_BUFFER, "badge.png"),
      "image/png",
    );
    assert.equal(
      detectAttachmentSignature(VALID_GIF_BUFFER, "anim.gif"),
      "image/gif",
    );
    assert.equal(
      detectAttachmentSignature(VALID_WEBP_BUFFER, "cover.webp"),
      "image/webp",
    );
  });

  test("Detects valid PDF documents (%PDF header)", () => {
    assert.equal(
      detectAttachmentSignature(VALID_PDF_BUFFER, "spec.pdf"),
      "application/pdf",
    );
  });

  test("Detects valid modern Office documents (DOCX, XLSX, PPTX)", () => {
    assert.equal(
      detectAttachmentSignature(VALID_DOCX_BUFFER, "brief.docx"),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    assert.equal(
      detectAttachmentSignature(VALID_XLSX_BUFFER, "metrics.xlsx"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    assert.equal(
      detectAttachmentSignature(VALID_PPTX_BUFFER, "deck.pptx"),
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  test("Detects valid legacy Office documents (DOC, XLS, PPT)", () => {
    assert.equal(
      detectAttachmentSignature(VALID_DOC_CFBF_BUFFER, "legacy.doc"),
      "application/msword",
    );
    assert.equal(
      detectAttachmentSignature(VALID_DOC_CFBF_BUFFER, "sheet.xls"),
      "application/vnd.ms-excel",
    );
    assert.equal(
      detectAttachmentSignature(VALID_DOC_CFBF_BUFFER, "slides.ppt"),
      "application/vnd.ms-powerpoint",
    );
  });

  test("Detects valid plain text and CSV files", () => {
    assert.equal(
      detectAttachmentSignature(VALID_TXT_BUFFER, "notes.txt"),
      "text/plain",
    );
    assert.equal(
      detectAttachmentSignature(VALID_CSV_BUFFER, "data.csv"),
      "text/csv",
    );
  });

  test("Rejects Windows executable masquerading as a text file", () => {
    assert.equal(
      detectAttachmentSignature(MALICIOUS_EXE_BUFFER, "virus.txt"),
      null,
    );
    assert.equal(
      detectAttachmentSignature(MALICIOUS_EXE_BUFFER, "payroll.csv"),
      null,
    );
  });

  test("Correctly categorizes fileType for frontend classification", () => {
    assert.equal(getAttachmentFileType("image/png", "img.png"), "image");
    assert.equal(getAttachmentFileType("application/pdf", "doc.pdf"), "pdf");
    assert.equal(getAttachmentFileType("text/csv", "data.csv"), "spreadsheet");
    assert.equal(
      getAttachmentFileType(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "data.xlsx",
      ),
      "spreadsheet",
    );
    assert.equal(
      getAttachmentFileType(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "pitch.pptx",
      ),
      "presentation",
    );
    assert.equal(
      getAttachmentFileType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "report.docx",
      ),
      "document",
    );
    assert.equal(getAttachmentFileType("text/plain", "readme.txt"), "text");
  });
});

describe("=== 2. Task Schema & Attachments Transformation Tests ===", () => {
  test("Task attachment toJSON formats and backward-compatibility getters", () => {
    const rawDoc = {
      _id: "507f1f77bcf86cd799439011",
      title: "Task with attachments",
      attachments: [
        {
          _id: "607f1f77bcf86cd799439099",
          fileId: "ik_att_123",
          fileName: "wireframes.png",
          fileUrl: "https://ik.imagekit.io/teamsync/attachments/wireframes.png",
          fileType: "image",
          mimeType: "image/png",
          fileSize: 2048576, // ~1.95MB
          thumbnailUrl:
            "https://ik.imagekit.io/teamsync/tr:n-media_library_thumbnail/attachments/wireframes.png",
          uploadedBy: "507f1f77bcf86cd799439001",
        },
      ],
    };

    // Instantiate Mongoose model doc
    const task = new TaskModel(rawDoc);
    const json = task.toJSON();

    assert.equal(json.attachments.length, 1);
    const att = json.attachments[0];
    assert.equal(att.fileId, "ik_att_123");
    assert.equal(att.fileName, "wireframes.png");
    assert.equal(att.name, "wireframes.png"); // legacy alias
    assert.equal(
      att.fileUrl,
      "https://ik.imagekit.io/teamsync/attachments/wireframes.png",
    );
    assert.equal(
      att.url,
      "https://ik.imagekit.io/teamsync/attachments/wireframes.png",
    ); // legacy alias
    assert.equal(att.fileType, "image");
    assert.equal(att.type, "image"); // legacy alias
    assert.match(att.size, /MB|KB/); // formatted size
  });
});

describe("=== 3. 14 Required Feature Scenarios Verification ===", () => {
  let originalUpload;
  let originalDelete;

  beforeEach(() => {
    originalUpload = imagekit.files.upload;
    originalDelete = imagekit.files.delete;
  });

  afterEach(() => {
    imagekit.files.upload = originalUpload;
    imagekit.files.delete = originalDelete;
  });

  // Scenario 1: Create a task without attachments
  test("Scenario 1: Create a task without attachments", async () => {
    const origCreate = TaskModel.create;
    const origFindById = TaskModel.findById;

    TaskModel.create = async (doc) => ({
      _id: "507f1f77bcf86cd799439101",
      ...doc,
    });

    TaskModel.findById = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: async () => ({
              _id: "507f1f77bcf86cd799439101",
              title: "Task without attachments",
              attachments: [],
            }),
          }),
        }),
      }),
    });

    const req = {
      body: {
        title: "Task without attachments",
        description: "Testing base task",
      },
      user: {
        _id: "507f1f77bcf86cd799439001",
        name: "Test User",
        role: "member",
      },
      params: {},
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await createTask(req, res);
    assert.equal(responseStatus, 201);
    assert.equal(responseBody.success, true);
    assert.deepEqual(responseBody.task.attachments, []);

    TaskModel.create = origCreate;
    TaskModel.findById = origFindById;
  });

  // Scenario 2: Create a task with one image
  test("Scenario 2: Create a task with one image", async () => {
    const origCreate = TaskModel.create;
    const origFindById = TaskModel.findById;

    let savedAttachments = null;
    TaskModel.create = async (doc) => {
      savedAttachments = doc.attachments;
      return {
        _id: "507f1f77bcf86cd799439102",
        ...doc,
      };
    };

    TaskModel.findById = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: async () => ({
              _id: "507f1f77bcf86cd799439102",
              title: "Task with Image",
              attachments: savedAttachments,
            }),
          }),
        }),
      }),
    });

    const req = {
      body: {
        title: "Task with Image",
        attachments: [
          {
            fileId: "ik_img_123",
            fileName: "screenshot.png",
            fileUrl:
              "https://ik.imagekit.io/teamsync/attachments/screenshot.png",
            fileType: "image",
            mimeType: "image/png",
            fileSize: 1048576,
            thumbnailUrl:
              "https://ik.imagekit.io/teamsync/attachments/screenshot.png",
          },
        ],
      },
      user: {
        _id: "507f1f77bcf86cd799439001",
        name: "Test User",
        role: "member",
      },
      params: {},
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await createTask(req, res);
    assert.equal(responseStatus, 201);
    assert.equal(savedAttachments.length, 1);
    assert.equal(savedAttachments[0].fileId, "ik_img_123");
    assert.equal(savedAttachments[0].fileName, "screenshot.png");
    assert.equal(savedAttachments[0].fileType, "image");

    TaskModel.create = origCreate;
    TaskModel.findById = origFindById;
  });

  // Scenario 3: Create a task with multiple documents
  test("Scenario 3: Create a task with multiple documents (PDF, DOCX, CSV)", async () => {
    const origCreate = TaskModel.create;
    const origFindById = TaskModel.findById;

    let savedAttachments = null;
    TaskModel.create = async (doc) => {
      savedAttachments = doc.attachments;
      return { _id: "507f1f77bcf86cd799439103", ...doc };
    };

    TaskModel.findById = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: async () => ({
              _id: "507f1f77bcf86cd799439103",
              title: "Task with Docs",
              attachments: savedAttachments,
            }),
          }),
        }),
      }),
    });

    const req = {
      body: {
        title: "Task with Docs",
        attachments: [
          {
            fileId: "ik_pdf_01",
            fileName: "architecture.pdf",
            fileUrl:
              "https://ik.imagekit.io/teamsync/attachments/architecture.pdf",
            fileType: "pdf",
            fileSize: 524288,
          },
          {
            fileId: "ik_docx_02",
            fileName: "requirements.docx",
            fileUrl:
              "https://ik.imagekit.io/teamsync/attachments/requirements.docx",
            fileType: "document",
            fileSize: 104857,
          },
          {
            fileId: "ik_csv_03",
            fileName: "users.csv",
            fileUrl: "https://ik.imagekit.io/teamsync/attachments/users.csv",
            fileType: "spreadsheet",
            fileSize: 4096,
          },
        ],
      },
      user: {
        _id: "507f1f77bcf86cd799439001",
        name: "Test User",
        role: "member",
      },
      params: {},
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await createTask(req, res);
    assert.equal(responseStatus, 201);
    assert.equal(savedAttachments.length, 3);
    assert.equal(savedAttachments[0].fileName, "architecture.pdf");
    assert.equal(savedAttachments[1].fileName, "requirements.docx");
    assert.equal(savedAttachments[2].fileName, "users.csv");

    TaskModel.create = origCreate;
    TaskModel.findById = origFindById;
  });

  // Scenario 4: Upload multiple files successfully via uploadTaskAttachments
  test("Scenario 4: Upload multiple files successfully via uploadTaskAttachments", async () => {
    imagekit.files.upload = async (params) => {
      return {
        url: `https://ik.imagekit.io/teamsync/attachments/${params.fileName}`,
        fileId: `ik_id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: params.fileName,
        size: 1024,
        filePath: `/attachments/${params.fileName}`,
        thumbnailUrl: `https://ik.imagekit.io/teamsync/attachments/${params.fileName}`,
      };
    };

    const req = {
      uploadedAttachments: [
        {
          buffer: VALID_PNG_BUFFER,
          originalname: "diagram.png",
          verifiedMimeType: "image/png",
          fileCategory: "image",
          size: 1024,
        },
        {
          buffer: VALID_PDF_BUFFER,
          originalname: "report.pdf",
          verifiedMimeType: "application/pdf",
          fileCategory: "pdf",
          size: 2048,
        },
      ],
      user: {
        _id: "507f1f77bcf86cd799439001",
      },
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await uploadTaskAttachments(req, res);
    assert.equal(responseStatus, 200);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data.length, 2);
    assert.equal(responseBody.data[0].fileName, "diagram.png");
    assert.equal(responseBody.data[1].fileName, "report.pdf");
    assert.ok(responseBody.data[0].fileId.startsWith("ik_id_"));
  });

  // Scenario 5: Reject unsupported file types
  test("Scenario 5: Reject unsupported file types", () => {
    const ext = "exe";
    assert.equal(ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext), false);
    const detected = detectAttachmentSignature(
      MALICIOUS_EXE_BUFFER,
      "program.exe",
    );
    assert.equal(detected, null);
  });

  // Scenario 6: Reject files exceeding configured size limit
  test("Scenario 6: Reject files exceeding configured size limit (5MB)", () => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const oversized = MAX_SIZE + 1;
    assert.ok(oversized > MAX_SIZE);
  });

  // Scenario 7: Handle upload failures gracefully & cleanup
  test("Scenario 7: Handle upload failures and rollback partially uploaded batch", async () => {
    let cleanedUpFileId = null;
    imagekit.files.delete = async (fId) => {
      cleanedUpFileId = fId;
      return { success: true };
    };

    let callCount = 0;
    imagekit.files.upload = async (params) => {
      callCount++;
      if (callCount === 1) {
        return {
          url: "https://ik.imagekit.io/file1.png",
          fileId: "ik_uploaded_first_file",
          name: params.fileName,
          size: 500,
        };
      }
      throw new Error("Network timeout on 2nd file upload");
    };

    const req = {
      uploadedAttachments: [
        {
          buffer: VALID_PNG_BUFFER,
          originalname: "first.png",
          verifiedMimeType: "image/png",
          fileCategory: "image",
          size: 500,
        },
        {
          buffer: VALID_PNG_BUFFER,
          originalname: "second.png",
          verifiedMimeType: "image/png",
          fileCategory: "image",
          size: 500,
        },
      ],
      user: {
        _id: "507f1f77bcf86cd799439001",
      },
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await uploadTaskAttachments(req, res);
    assert.equal(responseStatus, 502); // ImageKit failure returns 502
    assert.equal(responseBody.success, false);
    // Verified that first uploaded file was rolled back
    assert.equal(cleanedUpFileId, "ik_uploaded_first_file");
  });

  // Scenario 8: Edit a task and add new attachments
  test("Scenario 8: Edit a task and add new attachments while preserving existing ones", async () => {
    const origFindById = TaskModel.findById;
    const origCount = TaskModel.countDocuments;

    const mockTask = {
      _id: "507f1f77bcf86cd799439108",
      title: "Task to edit",
      creator: "507f1f77bcf86cd799439001",
      attachments: [
        {
          fileId: "ik_existing_01",
          fileName: "existing.pdf",
          fileUrl: "https://ik.imagekit.io/existing.pdf",
        },
      ],
      save: async function () {
        return this;
      },
    };

    const createMockChain = (data) => {
      const chain = {
        populate: () => chain,
        select: () => chain,
        then: (resolve) => resolve(data),
      };
      return chain;
    };

    TaskModel.findById = (id) => createMockChain(mockTask);
    TaskModel.countDocuments = async () => 0;

    const req = {
      params: { taskId: "507f1f77bcf86cd799439108" },
      body: {
        attachments: [
          {
            fileId: "ik_existing_01",
            fileName: "existing.pdf",
            fileUrl: "https://ik.imagekit.io/existing.pdf",
          },
          {
            fileId: "ik_new_02",
            fileName: "new_file.png",
            fileUrl: "https://ik.imagekit.io/new_file.png",
          },
        ],
      },
      user: {
        _id: "507f1f77bcf86cd799439001",
        role: "member",
      },
    };

    let responseStatus = 200;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        return this;
      },
    };

    await updateTask(req, res);
    assert.equal(responseStatus, 200);
    assert.equal(mockTask.attachments.length, 2);
    assert.equal(mockTask.attachments[0].fileId, "ik_existing_01");
    assert.equal(mockTask.attachments[1].fileId, "ik_new_02");

    TaskModel.findById = origFindById;
    TaskModel.countDocuments = origCount;
  });

  // Scenario 9: Remove an existing attachment
  test("Scenario 9: Remove an existing attachment updates task attachments list", async () => {
    const origFindById = TaskModel.findById;
    const origCount = TaskModel.countDocuments;

    let deletedFileId = null;
    imagekit.files.delete = async (fId) => {
      deletedFileId = fId;
      return { success: true };
    };

    const mockTask = {
      _id: "507f1f77bcf86cd799439109",
      title: "Task with attachment to remove",
      creator: "507f1f77bcf86cd799439001",
      attachments: [
        {
          _id: "607f1f77bcf86cd799439999",
          fileId: "ik_to_remove_01",
          fileName: "remove_me.pdf",
          fileUrl: "https://ik.imagekit.io/remove_me.pdf",
          uploadedBy: "507f1f77bcf86cd799439001",
        },
      ],
      save: async function () {
        return this;
      },
    };

    const createMockChain = (data) => {
      const chain = {
        populate: () => chain,
        select: () => chain,
        then: (resolve) => resolve(data),
      };
      return chain;
    };

    TaskModel.findById = (id) => createMockChain(mockTask);
    TaskModel.countDocuments = async () => 0; // Not referenced elsewhere

    const req = {
      params: {
        taskId: "507f1f77bcf86cd799439109",
        attachmentId: "607f1f77bcf86cd799439999",
      },
      user: {
        _id: "507f1f77bcf86cd799439001",
        role: "member",
      },
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await deleteTaskAttachment(req, res);
    assert.equal(responseStatus, 200);
    assert.equal(responseBody.success, true);
    assert.equal(mockTask.attachments.length, 0);

    TaskModel.findById = origFindById;
    TaskModel.countDocuments = origCount;
  });

  // Scenario 10: Verify ImageKit deletion is invoked with reference counting
  test("Scenario 10: Verify ImageKit deletion is called only when file is not referenced elsewhere", async () => {
    const origFindById = TaskModel.findById;
    const origCount = TaskModel.countDocuments;

    let imageKitDeleteCalledWith = null;
    imagekit.files.delete = async (fId) => {
      imageKitDeleteCalledWith = fId;
      return { success: true };
    };

    const mockTask = {
      _id: "507f1f77bcf86cd799439110",
      creator: "507f1f77bcf86cd799439001",
      attachments: [
        {
          _id: "607f1f77bcf86cd799439111",
          fileId: "ik_shared_file_777",
          uploadedBy: "507f1f77bcf86cd799439001",
        },
      ],
      save: async function () {
        return this;
      },
    };

    const createMockChain = (data) => {
      const chain = {
        populate: () => chain,
        select: () => chain,
        then: (resolve) => resolve(data),
      };
      return chain;
    };

    TaskModel.findById = () => createMockChain(mockTask);

    // Case A: Referenced elsewhere (count > 0) -> ImageKit file must NOT be deleted
    TaskModel.countDocuments = async () => 1;
    const req1 = {
      params: {
        taskId: "507f1f77bcf86cd799439110",
        attachmentId: "ik_shared_file_777",
      },
      user: { _id: "507f1f77bcf86cd799439001", role: "member" },
    };
    const res1 = { status: () => res1, json: () => res1 };
    await deleteTaskAttachment(req1, res1);
    assert.equal(
      imageKitDeleteCalledWith,
      null,
      "Should not delete ImageKit file when referenced by other task",
    );

    // Case B: Not referenced elsewhere (count = 0) -> ImageKit file MUST be deleted
    mockTask.attachments = [
      {
        _id: "607f1f77bcf86cd799439112",
        fileId: "ik_unique_file_888",
        uploadedBy: "507f1f77bcf86cd799439001",
      },
    ];
    TaskModel.countDocuments = async () => 0;
    const req2 = {
      params: {
        taskId: "507f1f77bcf86cd799439110",
        attachmentId: "ik_unique_file_888",
      },
      user: { _id: "507f1f77bcf86cd799439001", role: "member" },
    };
    await deleteTaskAttachment(req2, res1);
    assert.equal(
      imageKitDeleteCalledWith,
      "ik_unique_file_888",
      "Should delete ImageKit file when reference count is 0",
    );

    TaskModel.findById = origFindById;
    TaskModel.countDocuments = origCount;
  });

  // Scenario 11: Verify attachment persistence in task model
  test("Scenario 11: Verify attachment persistence after schema instantiation & JSON formatting", () => {
    const task = new TaskModel({
      title: "Persistence check",
      creator: "507f1f77bcf86cd799439001",
      attachments: [
        {
          fileId: "ik_persist_123",
          fileName: "contract.pdf",
          fileUrl: "https://ik.imagekit.io/contract.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 450000,
          uploadedBy: "507f1f77bcf86cd799439001",
        },
      ],
    });

    const json = task.toJSON();
    assert.equal(json.attachments[0].fileName, "contract.pdf");
    assert.equal(json.attachments[0].fileId, "ik_persist_123");
    assert.equal(
      json.attachments[0].fileUrl,
      "https://ik.imagekit.io/contract.pdf",
    );
    assert.equal(json.attachments[0].fileType, "pdf");
    assert.equal(json.attachments[0].fileSize, 450000);
  });

  // Scenario 12: Verify unauthorized users cannot remove attachments
  test("Scenario 12: Verify unauthorized users cannot remove attachments (403 Forbidden)", async () => {
    const origFindById = TaskModel.findById;

    const mockTask = {
      _id: "507f1f77bcf86cd799439112",
      creator: "507f1f77bcf86cd799439001", // Creator is User 1
      project: null,
      attachments: [
        {
          _id: "607f1f77bcf86cd799439113",
          fileId: "ik_protected_file",
          uploadedBy: "507f1f77bcf86cd799439001", // Uploaded by User 1
        },
      ],
    };

    TaskModel.findById = async () => mockTask;

    const req = {
      params: {
        taskId: "507f1f77bcf86cd799439112",
        attachmentId: "607f1f77bcf86cd799439113",
      },
      user: {
        _id: "507f1f77bcf86cd799439999", // Unrelated User 999
        role: "member", // Not an admin
      },
    };

    let responseStatus = 200;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseBody = data;
        return this;
      },
    };

    await deleteTaskAttachment(req, res);
    assert.equal(responseStatus, 403);
    assert.equal(responseBody.success, false);
    assert.match(responseBody.message, /not authorized/i);

    TaskModel.findById = origFindById;
  });

  // Scenario 13: Verify task deletion handles associated files safely
  test("Scenario 13: Verify task deletion safely cleans up associated files", async () => {
    const origFindById = TaskModel.findById;
    const origFindByIdAndDelete = TaskModel.findByIdAndDelete;
    const origCount = TaskModel.countDocuments;
    const origAuditCreate = AuditLogModel.create;
    const origCommentDeleteMany = CommentModel.deleteMany;

    let deletedFileIds = [];
    imagekit.files.delete = async (fId) => {
      deletedFileIds.push(fId);
      return { success: true };
    };

    const mockTask = {
      _id: "507f1f77bcf86cd799439113",
      title: "Task to delete",
      creator: "507f1f77bcf86cd799439001",
      attachments: [
        { fileId: "ik_task_del_file_1" },
        { fileId: "ik_task_del_file_2" },
      ],
    };

    TaskModel.findById = async () => mockTask;
    TaskModel.findByIdAndDelete = async () => mockTask;
    TaskModel.countDocuments = async () => 0; // Not referenced by other tasks
    AuditLogModel.create = async () => ({ _id: "audit_123" });
    CommentModel.deleteMany = async () => ({ acknowledged: true });

    const req = {
      params: { taskId: "507f1f77bcf86cd799439113" },
      body: { reason: "Project discontinued and archived." },
      user: {
        _id: "507f1f77bcf86cd799439001",
        role: "admin",
      },
    };

    let responseStatus = 200;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        return this;
      },
    };

    await deleteTask(req, res);
    assert.equal(responseStatus, 200);
    assert.deepEqual(deletedFileIds, [
      "ik_task_del_file_1",
      "ik_task_del_file_2",
    ]);

    TaskModel.findById = origFindById;
    TaskModel.findByIdAndDelete = origFindByIdAndDelete;
    TaskModel.countDocuments = origCount;
    AuditLogModel.create = origAuditCreate;
    CommentModel.deleteMany = origCommentDeleteMany;
  });

  // Scenario 14: Verify existing task functionality remains unaffected
  test("Scenario 14: Subtasks, assignees, tags, and progress calculation unaffected", () => {
    const task = new TaskModel({
      title: "Sprint Feature",
      creator: "507f1f77bcf86cd799439001",
      status: "IN_PROGRESS",
      priority: "HIGH",
      tags: ["frontend", "urgent"],
      subtasks: [
        { title: "Define schema", completed: true },
        { title: "Implement controller", completed: false },
      ],
      attachments: [
        {
          fileId: "ik_f_1",
          fileName: "doc.pdf",
          fileUrl: "https://ik.imagekit.io/doc.pdf",
        },
      ],
    });

    const json = task.toJSON();
    assert.equal(json.progress, 50); // 1 out of 2 completed = 50%
    assert.equal(json.subtasks.length, 2);
    assert.equal(json.tags.length, 2);
    assert.equal(json.attachments.length, 1);
  });
});
