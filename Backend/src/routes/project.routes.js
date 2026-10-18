import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getEligibleMembers,
} from "../controllers/project.controller.js";
import {
  getTasks,
  createTask,
} from "../controllers/task.controller.js";
import {
  updateProjectCover,
  deleteProjectCover,
} from "../controllers/media.controller.js";
import { protect, requireManagerOrAdmin } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// Project List & Creation (Only Admins and Managers can create projects)
router.route("/")
  .get(getProjects)
  .post(requireManagerOrAdmin, createProject);

// Eligible Members for Project (Must be before :projectId)
router.get("/:projectId/eligible-members", getEligibleMembers);

// Project Members Sub-resource
router.route("/:projectId/members")
  .get(getProjectMembers)
  .post(addProjectMember);

router.route("/:projectId/members/:userId")
  .patch(updateProjectMemberRole)
  .put(updateProjectMemberRole)
  .delete(removeProjectMember);

// Project Tasks Sub-resource
router.route("/:projectId/tasks")
  .get(getTasks)
  .post(createTask);

// Cover Image Endpoints
router.patch("/:projectId/image", uploadSingleImage("image"), updateProjectCover);
router.delete("/:projectId/image", deleteProjectCover);

// Single Project CRUD
router.route("/:projectId")
  .get(getProjectById)
  .patch(updateProject)
  .put(updateProject)
  .delete(deleteProject);

export default router;
