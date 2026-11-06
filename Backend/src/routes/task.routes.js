import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleSubtask,
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  clearTaskComments,
  uploadTaskAttachments,
  getTaskAttachments,
  attachFilesToTask,
  deleteTaskAttachment,
  deleteOrphanAttachment,
} from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAttachments } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// 1. Standalone Task Attachments Upload & Cleanup (before /:taskId)
router.post("/attachments/upload", uploadAttachments(true), uploadTaskAttachments);
router.delete("/attachments/:fileId", deleteOrphanAttachment);

// 2. Base Task Collections
router.route("/")
  .get(getTasks)
  .post(createTask);

// 3. Task Comments
router.route("/:taskId/comments")
  .get(getTaskComments)
  .post(createTaskComment)
  .delete(clearTaskComments);

router.delete("/:taskId/comments/:commentId", deleteTaskComment);

// 4. Subtasks
router.patch("/:taskId/subtasks/:subtaskId", toggleSubtask);
router.patch("/:taskId/subtasks/:subtaskId/toggle", toggleSubtask);

// 5. Task-specific Attachments
router.route("/:taskId/attachments")
  .get(getTaskAttachments)
  .post(uploadAttachments(true), attachFilesToTask);

router.delete("/:taskId/attachments/:attachmentId", deleteTaskAttachment);

// 6. Single Task CRUD
router.route("/:taskId")
  .get(getTaskById)
  .patch(updateTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;
