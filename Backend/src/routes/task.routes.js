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
} from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getTasks)
  .post(createTask);

router.route("/:taskId/comments")
  .get(getTaskComments)
  .post(createTaskComment)
  .delete(clearTaskComments);

router.delete("/:taskId/comments/:commentId", deleteTaskComment);

router.patch("/:taskId/subtasks/:subtaskId", toggleSubtask);
router.patch("/:taskId/subtasks/:subtaskId/toggle", toggleSubtask);

router.route("/:taskId")
  .get(getTaskById)
  .patch(updateTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;
