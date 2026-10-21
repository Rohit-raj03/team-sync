import mongoose from "mongoose";
import ProjectModel from "../models/project.model.js";
import UserModel from "../models/user.model.js";
import TaskModel from "../models/task.model.js";
import CommentModel from "../models/comment.model.js";
import NotificationModel from "../models/notification.model.js";

/**
 * Helper to compute task statistics for projects
 */
const attachTaskStats = async (projects) => {
  if (!projects || projects.length === 0) return [];
  const projectIds = projects.map((p) => p._id);

  const stats = await TaskModel.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: "$project",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [
              { $in: ["$status", ["COMPLETED", "Completed", "Done"]] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsMap = new Map();
  stats.forEach((s) => {
    statsMap.set(s._id.toString(), s);
  });

  return projects.map((project) => {
    const json = project.toJSON ? project.toJSON() : project;
    const stat = statsMap.get(project._id.toString()) || {
      totalTasks: 0,
      completedTasks: 0,
    };
    const progress =
      stat.totalTasks > 0
        ? Math.round((stat.completedTasks / stat.totalTasks) * 100)
        : json.progress || 0;

    return {
      ...json,
      tasksCount: stat.totalTasks,
      completedTasksCount: stat.completedTasks,
      progress,
      membersCount: json.members?.length || 0,
    };
  });
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const {
      name,
      key,
      description,
      category,
      status,
      priority,
      color,
      startDate,
      dueDate,
      endDate,
      budget,
      members,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Format members if passed as array of user IDs or objects
    const initialMembers = [
      {
        user: req.user._id,
        role: "Owner",
        projectRole: "Project Owner",
        tags: ["Project Owner"],
        joinedAt: new Date(),
      },
    ];

    if (Array.isArray(members)) {
      for (const m of members) {
        const userId = typeof m === "string" ? m : m.id || m._id || m.user;
        if (
          userId &&
          mongoose.Types.ObjectId.isValid(userId) &&
          userId.toString() !== req.user._id.toString()
        ) {
          const userDoc = await UserModel.findById(userId);
          if (userDoc) {
            const memberTags =
              Array.isArray(m.tags) && m.tags.length > 0
                ? m.tags
                : m.projectRole
                ? [m.projectRole]
                : ["Contributor"];
            initialMembers.push({
              user: userDoc._id,
              role: m.role || "Member",
              projectRole: m.projectRole || memberTags[0] || "Contributor",
              tags: memberTags,
              joinedAt: new Date(),
            });
          }
        }
      }
    }

    const project = await ProjectModel.create({
      name: name.trim(),
      key: key || name.trim().slice(0, 3).toUpperCase(),
      description: description || "",
      category: category || "Web Application",
      status: status || "ACTIVE",
      priority: priority || "MEDIUM",
      color: color || "#4361EE",
      manager: req.user._id,
      owner: req.user._id,
      startDate: startDate || new Date(),
      dueDate: dueDate || endDate,
      endDate: endDate || dueDate,
      budget: Number(budget) || 0,
      members: initialMembers,
    });

    const populated = await ProjectModel.findById(project._id)
      .populate("manager", "name email avatar username jobTitle")
      .populate("owner", "name email avatar username jobTitle")
      .populate("members.user", "name email avatar username jobTitle");

    const [withStats] = await attachTaskStats([populated]);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: withStats,
      data: withStats,
    });
  } catch (error) {
    console.error("createProject error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating project",
    });
  }
};

/**
 * @desc    Get all accessible projects
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    const { search, status, category, priority, sort } = req.query;

    const query = {};

    // Access control: admins see all; regular users see projects where they are manager or member
    if (req.user.role !== "admin") {
      query.$or = [
        { manager: req.user._id },
        { owner: req.user._id },
        { "members.user": req.user._id },
        { members: req.user._id }, // backwards-compatibility with old array format
      ];
    }

    // Status filter
    if (status && status !== "ALL") {
      const normalizedStatus = status.trim();
      query.status = { $regex: new RegExp(`^${normalizedStatus}$`, "i") };
    }

    // Category filter
    if (category && category !== "ALL") {
      query.category = { $regex: new RegExp(category.trim(), "i") };
    }

    // Priority filter
    if (priority && priority !== "ALL") {
      query.priority = { $regex: new RegExp(`^${priority.trim()}$`, "i") };
    }

    // Search filter
    if (search && search.trim()) {
      const s = search.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { key: { $regex: s, $options: "i" } },
          { description: { $regex: s, $options: "i" } },
          { category: { $regex: s, $options: "i" } },
        ],
      });
    }

    let sortOption = { createdAt: -1 };
    if (sort === "name") sortOption = { name: 1 };
    if (sort === "dueDate") sortOption = { dueDate: 1 };
    if (sort === "progress") sortOption = { progress: -1 };

    const projects = await ProjectModel.find(query)
      .populate("manager", "name email avatar username jobTitle")
      .populate("owner", "name email avatar username jobTitle")
      .populate("members.user", "name email avatar username jobTitle")
      .sort(sortOption);

    const enriched = await attachTaskStats(projects);

    return res.status(200).json({
      success: true,
      count: enriched.length,
      projects: enriched,
      data: enriched,
    });
  } catch (error) {
    console.error("getProjects error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching projects",
    });
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:projectId
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId)
      .populate("manager", "name email avatar username jobTitle")
      .populate("owner", "name email avatar username jobTitle")
      .populate("members.user", "name email avatar username jobTitle");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.isProjectMember(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this project",
      });
    }

    const [enriched] = await attachTaskStats([project]);

    return res.status(200).json({
      success: true,
      project: enriched,
      data: enriched,
    });
  } catch (error) {
    console.error("getProjectById error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching project",
    });
  }
};

/**
 * @desc    Update project
 * @route   PATCH /api/projects/:projectId (also PUT)
 * @access  Private
 */
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isSystemAdmin = req.user.role === "admin";
    const isSystemManager = req.user.role === "manager";
    const isProjectOwnerOrManager =
      project.owner?.toString() === req.user._id.toString() ||
      project.manager?.toString() === req.user._id.toString();

    if (!isSystemAdmin && !isSystemManager && !isProjectOwnerOrManager && !project.canManageProject(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project. Only Admins and Project Managers can update projects.",
      });
    }

    const allowedUpdates = [
      "name",
      "key",
      "description",
      "category",
      "status",
      "priority",
      "color",
      "startDate",
      "dueDate",
      "endDate",
      "budget",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    if (req.body.dueDate && !req.body.endDate) {
      project.endDate = req.body.dueDate;
    }

    await project.save();

    const populated = await ProjectModel.findById(projectId)
      .populate("manager", "name email avatar username jobTitle")
      .populate("owner", "name email avatar username jobTitle")
      .populate("members.user", "name email avatar username jobTitle");

    const [enriched] = await attachTaskStats([populated]);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: enriched,
      data: enriched,
    });
  } catch (error) {
    console.error("updateProject error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating project",
    });
  }
};

/**
 * @desc    Delete or archive project
 * @route   DELETE /api/projects/:projectId
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isSystemAdmin = req.user.role === "admin";
    const isSystemManager = req.user.role === "manager";
    const isProjectOwnerOrManager =
      project.owner?.toString() === req.user._id.toString() ||
      project.manager?.toString() === req.user._id.toString();

    if (!isSystemAdmin && !isSystemManager && !isProjectOwnerOrManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project. Only Admins and Project Managers can delete projects.",
      });
    }

    // Delete all connected tasks and comments
    await TaskModel.deleteMany({ project: projectId });
    await CommentModel.deleteMany({ project: projectId });
    await ProjectModel.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: `Project "${project.name}" and its associated tasks have been deleted.`,
    });
  } catch (error) {
    console.error("deleteProject error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error deleting project",
    });
  }
};

/**
 * @desc    Get project members
 * @route   GET /api/projects/:projectId/members
 * @access  Private
 */
export const getProjectMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId).populate(
      "members.user",
      "name email avatar username jobTitle"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.isProjectMember(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this project's members",
      });
    }

    const json = project.toJSON();

    return res.status(200).json({
      success: true,
      count: json.members?.length || 0,
      members: json.members || [],
      data: json.members || [],
    });
  } catch (error) {
    console.error("getProjectMembers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching project members",
    });
  }
};

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:projectId/members
 * @access  Private
 */
export const addProjectMember = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const { userId, email, role = "Member", projectRole = "Contributor" } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.canManageProject(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add members to this project",
      });
    }

    // Locate user by userId or email
    let targetUser = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      targetUser = await UserModel.findById(userId);
    } else if (email) {
      targetUser = await UserModel.findOne({
        email: email.trim().toLowerCase(),
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Registered user not found with provided ID or email",
      });
    }

    // Check duplicate membership
    const alreadyMember = project.members.some((m) => {
      const uid = m.user?._id?.toString() || m.user?.toString();
      return uid === targetUser._id.toString();
    });

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: `${targetUser.name} is already a member of this project`,
      });
    }

    // Validate role
    const validRoles = ["Owner", "Admin", "Member", "Viewer"];
    const assignedRole = validRoles.includes(role) ? role : "Member";

    const memberTags =
      Array.isArray(req.body.tags) && req.body.tags.length > 0
        ? req.body.tags
        : projectRole
        ? [projectRole]
        : ["Contributor"];

    project.members.push({
      user: targetUser._id,
      role: assignedRole,
      projectRole: projectRole || memberTags[0] || "Contributor",
      tags: memberTags,
      joinedAt: new Date(),
    });

    await project.save();

    // Create notification for added user
    if (targetUser._id.toString() !== req.user._id.toString()) {
      await NotificationModel.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: "project_invite",
        title: "Added to Project",
        message: `${req.user.name} added you to the project "${project.name}" as ${assignedRole}.`,
        link: `/projects/${project._id}`,
        relatedProject: project._id,
      });
    }

    const updatedProject = await ProjectModel.findById(projectId).populate(
      "members.user",
      "name email avatar username jobTitle"
    );

    const json = updatedProject.toJSON();
    const addedMember = json.members.find(
      (m) => (m.id || m._id).toString() === targetUser._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: `${targetUser.name} added to project`,
      member: addedMember,
      members: json.members,
      data: json.members,
    });
  } catch (error) {
    console.error("addProjectMember error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error adding member to project",
    });
  }
};

/**
 * @desc    Update project member role
 * @route   PATCH /api/projects/:projectId/members/:userId
 * @access  Private
 */
export const updateProjectMemberRole = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.params.userId || req.params.memberId;
    const { role, projectRole } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or user ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.canManageProject(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update member roles in this project",
      });
    }

    const member = project.members.find((m) => {
      const uid = m.user?._id?.toString() || m.user?.toString();
      return uid === userId.toString();
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this project",
      });
    }

    if (role) {
      const validRoles = ["Owner", "Admin", "Member", "Viewer"];
      if (validRoles.includes(role)) {
        member.role = role;
      }
    }

    if (projectRole !== undefined) {
      member.projectRole = projectRole;
    }

    if (req.body.tags !== undefined) {
      const updatedTags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      member.tags = updatedTags;
      if (!projectRole && updatedTags.length > 0) {
        member.projectRole = updatedTags[0];
      }
    }

    await project.save();

    const updated = await ProjectModel.findById(projectId).populate(
      "members.user",
      "name email avatar username jobTitle"
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      members: updated.toJSON().members,
      data: updated.toJSON().members,
    });
  } catch (error) {
    console.error("updateProjectMemberRole error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating member role",
    });
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:projectId/members/:userId
 * @access  Private
 */
export const removeProjectMember = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.params.userId || req.params.memberId;

    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or user ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.canManageProject(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove members from this project",
      });
    }

    // Safety: Cannot remove the project owner/manager
    const ownerId = project.manager?.toString() || project.owner?.toString();
    if (ownerId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the project owner from the project",
      });
    }

    project.members = project.members.filter((m) => {
      const uid = m.user?._id?.toString() || m.user?.toString();
      return uid !== userId.toString();
    });

    await project.save();

    // Remove user as assignee from project tasks
    await TaskModel.updateMany(
      { project: projectId },
      { $pull: { assignees: userId } }
    );

    const updated = await ProjectModel.findById(projectId).populate(
      "members.user",
      "name email avatar username jobTitle"
    );

    return res.status(200).json({
      success: true,
      message: "Member removed from project",
      members: updated.toJSON().members,
      data: updated.toJSON().members,
    });
  } catch (error) {
    console.error("removeProjectMember error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error removing member from project",
    });
  }
};

/**
 * @desc    Get eligible users to add as project members
 * @route   GET /api/projects/:projectId/eligible-members
 * @access  Private
 */
export const getEligibleMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const { search } = req.query;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const existingMemberIds = (project.members || [])
      .map((m) => (m.user?._id || m.user)?.toString())
      .filter(Boolean);

    const query = {
      _id: { $nin: existingMemberIds },
      isActive: true,
    };

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { username: { $regex: s, $options: "i" } },
      ];
    }

    const eligibleUsers = await UserModel.find(query)
      .select("name email avatar username jobTitle role")
      .limit(50);

    return res.status(200).json({
      success: true,
      count: eligibleUsers.length,
      users: eligibleUsers,
      data: eligibleUsers,
    });
  } catch (error) {
    console.error("getEligibleMembers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching eligible members",
    });
  }
};
