import mongoose from "mongoose";
import TaskModel from "../models/task.model.js";
import ProjectModel from "../models/project.model.js";
import UserModel from "../models/user.model.js";
import CommentModel from "../models/comment.model.js";
import NotificationModel from "../models/notification.model.js";
import AuditLogModel from "../models/auditLog.model.js";
import {
  uploadImage,
  deleteImage,
  safeCleanupFile,
  MEDIA_FOLDERS,
} from "../services/imagekit.service.js";

/**
 * Helper to parse @mentions from text and return matched member IDs
 * Supports formats:
 * - Direct ID/structured: @[Name](userId)
 * - Plain mention: @username or @name
 * If projectMemberUserIds is null, any registered user can be mentioned.
 */
const extractMentions = async (text, projectMemberUserIds = null) => {
  if (!text || typeof text !== "string") return [];
  const mentionedIds = new Set();

  // Pattern 1: Markdown-style mention @[Name](userId)
  const structuredRegex = /@\[([^\]]+)\]\(([a-fA-F0-9]{24})\)/g;
  let match;
  while ((match = structuredRegex.exec(text)) !== null) {
    const uid = match[2];
    if (!projectMemberUserIds || projectMemberUserIds.includes(uid)) {
      mentionedIds.add(uid);
    }
  }

  // Pattern 2: Standard username mention @username
  const usernameRegex = /@([a-zA-Z0-9_.-]+)/g;
  const usernames = [];
  while ((match = usernameRegex.exec(text)) !== null) {
    usernames.push(match[1].toLowerCase());
  }

  if (usernames.length > 0) {
    const userQuery = {
      $or: [
        { username: { $in: usernames } },
        { name: { $in: usernames.map((u) => new RegExp(`^${u}$`, "i")) } },
      ],
    };
    if (projectMemberUserIds && Array.isArray(projectMemberUserIds)) {
      userQuery._id = { $in: projectMemberUserIds };
    }
    const matchedUsers = await UserModel.find(userQuery).select("_id");

    matchedUsers.forEach((u) => mentionedIds.add(u._id.toString()));
  }

  return Array.from(mentionedIds);
};

/**
 * @desc    Get tasks (filterable by project, status, priority, search, assignee)
 * @route   GET /api/tasks OR GET /api/projects/:projectId/tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const { status, priority, search, assignee, dueDate } = req.query;

    const query = {};

    if (
      projectId === "individual" ||
      projectId === "none" ||
      req.query.isIndividual === "true"
    ) {
      query.$or = [{ project: null }, { project: { $exists: false } }];
    } else if (projectId) {
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

      if (!project.isProjectMember(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view tasks in this project",
        });
      }

      query.project = projectId;
    } else {
      // Find all projects accessible to the current user + include individual tasks (no project)
      if (req.user.role !== "admin") {
        const accessibleProjects = await ProjectModel.find({
          $or: [
            { manager: req.user._id },
            { owner: req.user._id },
            { "members.user": req.user._id },
            { members: req.user._id },
          ],
        }).select("_id");

        const accessibleIds = accessibleProjects.map((p) => p._id);
        query.$or = [
          { project: { $in: accessibleIds } },
          { project: null },
          { project: { $exists: false } },
        ];
      }
    }

    // Status filter
    if (status && status !== "ALL") {
      const normalized = status.trim();
      query.status = { $regex: new RegExp(`^${normalized}$`, "i") };
    }

    // Priority filter
    if (priority && priority !== "ALL") {
      query.priority = { $regex: new RegExp(`^${priority.trim()}$`, "i") };
    }

    // Assignee filter
    if (assignee && assignee !== "ALL") {
      if (mongoose.Types.ObjectId.isValid(assignee)) {
        query.assignees = assignee;
      }
    }

    // Search filter
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { tags: { $regex: s, $options: "i" } },
        { assignedTo: { $regex: s, $options: "i" } },
      ];
    }

    const tasks = await TaskModel.find(query)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      data: tasks,
    });
  } catch (error) {
    console.error("getTasks error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching tasks",
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:taskId
 * @access  Private
 */
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId)
      .populate("project", "name key color themeColor status category manager owner members")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Access check on task's project
    const project = task.project;
    if (project && !project.isProjectMember(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this task",
      });
    }

    return res.status(200).json({
      success: true,
      task,
      data: task,
    });
  } catch (error) {
    console.error("getTaskById error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching task details",
    });
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks OR POST /api/projects/:projectId/tasks
 * @access  Private
 */
export const createTask = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const {
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      estimatedTime,
      assignees,
      tags,
      subtasks,
      attachments,
      comment,
      mentions,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const isIndividual =
      !projectId ||
      projectId === "none" ||
      projectId === "individual" ||
      projectId === "";

    let project = null;
    let projectMemberUserIds = null;

    if (!isIndividual) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Valid projectId is required",
        });
      }

      project = await ProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      if (!project.isProjectMember(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You must be a member of this project to create tasks",
        });
      }

      // Validate project member user IDs
      projectMemberUserIds = [
        project.manager?.toString(),
        project.owner?.toString(),
        ...(project.members || []).map((m) =>
          (m.user?._id || m.user)?.toString()
        ),
      ].filter(Boolean);
    }

    // Validate and sanitize assignees
    const sanitizedAssignees = [];
    if (Array.isArray(assignees)) {
      for (const a of assignees) {
        const uid = typeof a === "string" ? a : a.id || a._id || a.user;
        if (uid && mongoose.Types.ObjectId.isValid(uid)) {
          if (projectMemberUserIds) {
            if (!projectMemberUserIds.includes(uid.toString())) {
              return res.status(400).json({
                success: false,
                message: `User ${uid} is not a member of project "${project.name}". Only project members can be assigned.`,
              });
            }
          } else {
            const userExists = await UserModel.exists({ _id: uid });
            if (!userExists) {
              continue;
            }
          }
          if (!sanitizedAssignees.includes(uid.toString())) {
            sanitizedAssignees.push(uid.toString());
          }
        }
      }
    }

    // Extract @mentions from description and combine with explicit mentions
    const textMentions = await extractMentions(
      description,
      projectMemberUserIds
    );
    const combinedMentions = new Set(textMentions);

    if (Array.isArray(mentions)) {
      for (const m of mentions) {
        const mid = typeof m === "string" ? m : m.id || m._id;
        if (mid && mongoose.Types.ObjectId.isValid(mid)) {
          if (projectMemberUserIds) {
            if (projectMemberUserIds.includes(mid.toString())) {
              combinedMentions.add(mid.toString());
            }
          } else {
            const userExists = await UserModel.exists({ _id: mid });
            if (userExists) {
              combinedMentions.add(mid.toString());
            }
          }
        }
      }
    }

    // Build comma-separated names for quick search / legacy display
    let assignedNames = "Unassigned";
    if (sanitizedAssignees.length > 0) {
      const assignedUsers = await UserModel.find({
        _id: { $in: sanitizedAssignees },
      }).select("name");
      assignedNames = assignedUsers.map((u) => u.name).join(", ");
    }

    // Format subtasks
    const formattedSubtasks = Array.isArray(subtasks)
      ? subtasks.map((s) => ({
          title: typeof s === "string" ? s : s.title,
          completed: Boolean(s.completed),
        }))
      : [];

    // Format & sanitize attachments
    const sanitizedAttachments = [];
    if (Array.isArray(attachments)) {
      for (const att of attachments) {
        if (!att || typeof att !== "object") continue;
        const fileId = att.fileId || att.id;
        const fileName = att.fileName || att.name;
        const fileUrl = att.fileUrl || att.url;
        if (!fileId || !fileName || !fileUrl) continue;

        sanitizedAttachments.push({
          fileId: String(fileId).trim(),
          fileName: String(fileName).trim(),
          name: String(fileName).trim(),
          fileUrl: String(fileUrl).trim(),
          url: String(fileUrl).trim(),
          fileType: att.fileType || att.type || "document",
          type: att.fileType || att.type || "document",
          mimeType: att.mimeType || "",
          fileSize: Number(att.fileSize) || 0,
          thumbnailUrl:
            att.thumbnailUrl || (att.fileType === "image" ? fileUrl : ""),
          uploadedBy: att.uploadedBy || req.user._id,
          uploadedAt: att.uploadedAt || new Date(),
        });
      }
    }

    const task = await TaskModel.create({
      title: title.trim(),
      description: description || "",
      project: project ? project._id : null,
      projectName: project ? project.name : (req.body.projectName || "Individual Task"),
      isIndividual: isIndividual,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      startDate: startDate || new Date(),
      dueDate: dueDate,
      estimatedTime: estimatedTime || "8h",
      creator: req.user._id,
      assignees: sanitizedAssignees,
      assignedTo: assignedNames,
      tags: Array.isArray(tags) ? tags : [],
      subtasks: formattedSubtasks,
      attachments: sanitizedAttachments,
      comment: comment || "",
      mentions: Array.from(combinedMentions),
    });

    // Create notifications for assignees (other than the creator)
    for (const assigneeId of sanitizedAssignees) {
      if (assigneeId.toString() !== req.user._id.toString()) {
        await NotificationModel.create({
          recipient: assigneeId,
          sender: req.user._id,
          type: "assignment",
          title: "New Task Assigned",
          message: project
            ? `${req.user.name} assigned you to "${task.title}" in ${project.name}.`
            : `${req.user.name} assigned you to individual task "${task.title}".`,
          link: `/tasks/${task._id}`,
          relatedProject: project ? project._id : undefined,
          relatedTask: task._id,
        });
      }
    }

    // Create notifications for mentioned users
    for (const mentionedId of combinedMentions) {
      if (
        mentionedId.toString() !== req.user._id.toString() &&
        !sanitizedAssignees.includes(mentionedId.toString())
      ) {
        await NotificationModel.create({
          recipient: mentionedId,
          sender: req.user._id,
          type: "mention",
          title: "Mentioned in Task",
          message: `${req.user.name} mentioned you in task "${task.title}".`,
          link: `/tasks/${task._id}`,
          relatedProject: project ? project._id : undefined,
          relatedTask: task._id,
        });
      }
    }

    const populated = await TaskModel.findById(task._id)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populated,
      data: populated,
    });
  } catch (error) {
    // Two-phase rollback: Clean up newly uploaded files from ImageKit if task creation fails
    const rawAttachments = req.body?.attachments;
    if (Array.isArray(rawAttachments)) {
      for (const att of rawAttachments) {
        const fileId = att?.fileId || att?.id;
        if (fileId && typeof fileId === "string" && !fileId.startsWith("att-")) {
          safeCleanupFile(fileId).catch(() => {});
        }
      }
    }

    console.error("createTask error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating task",
    });
  }
};

/**
 * @desc    Update task (details, status, priority, assignees, subtasks)
 * @route   PATCH /api/tasks/:taskId (also PUT)
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let project = null;
    let projectMemberUserIds = null;
    if (task.project) {
      project = await ProjectModel.findById(task.project);
      if (!project || !project.isProjectMember(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update tasks in this project",
        });
      }

      // Project member IDs for validation
      projectMemberUserIds = [
        project.manager?.toString(),
        project.owner?.toString(),
        ...(project.members || []).map((m) =>
          (m.user?._id || m.user)?.toString()
        ),
      ].filter(Boolean);
    }

    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const canManage = project ? project.canManageProject(req.user._id, req.user.role) : false;
    const isAssignee = (task.assignees || []).some(
      (a) => (a?._id || a)?.toString() === req.user._id.toString()
    );

    if (!isAdmin && !canManage && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this task. Members can only update tasks assigned to them or created by them.",
      });
    }

    // Validate title if updated
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title is required.",
        });
      }
      if (req.body.title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Task title must be at least 3 characters.",
        });
      }
      task.title = req.body.title.trim();
    }

    // Validate dates if updated
    const prospectiveStart =
      req.body.startDate !== undefined
        ? req.body.startDate
          ? new Date(req.body.startDate)
          : null
        : task.startDate;
    const prospectiveDue =
      req.body.dueDate !== undefined
        ? req.body.dueDate
          ? new Date(req.body.dueDate)
          : null
        : task.dueDate;

    if (
      prospectiveStart &&
      prospectiveDue &&
      !isNaN(prospectiveStart.getTime()) &&
      !isNaN(prospectiveDue.getTime())
    ) {
      if (prospectiveDue.getTime() < prospectiveStart.getTime()) {
        return res.status(400).json({
          success: false,
          message: "Due date cannot be before start date.",
        });
      }
    }

    // Update project association if provided and permitted
    if (req.body.projectId !== undefined || req.body.project !== undefined) {
      const targetProjId =
        req.body.projectId !== undefined
          ? req.body.projectId
          : req.body.project;

      if (!targetProjId || targetProjId === "null" || targetProjId === "") {
        task.project = null;
        task.projectName = "Individual Task";
        task.isIndividual = true;
        project = null;
        projectMemberUserIds = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetProjId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid target project ID format.",
          });
        }
        const targetProj = await ProjectModel.findById(targetProjId);
        if (!targetProj) {
          return res.status(404).json({
            success: false,
            message: "Target project not found.",
          });
        }
        if (!targetProj.isProjectMember(req.user._id, req.user.role)) {
          return res.status(403).json({
            success: false,
            message: `You are not authorized to assign tasks to project "${targetProj.name}".`,
          });
        }
        task.project = targetProj._id;
        task.projectName = targetProj.name;
        task.isIndividual = false;
        project = targetProj;
        projectMemberUserIds = [
          targetProj.manager?.toString(),
          targetProj.owner?.toString(),
          ...(targetProj.members || []).map(
            (m) => (m.user?._id || m.user)?.toString()
          ),
        ].filter(Boolean);
      }
    }

    // Validate assignees if updated
    if (req.body.assignees !== undefined) {
      const sanitized = [];
      if (Array.isArray(req.body.assignees)) {
        for (const a of req.body.assignees) {
          const uid = typeof a === "string" ? a : a.id || a._id || a.user;
          if (uid && mongoose.Types.ObjectId.isValid(uid)) {
            if (projectMemberUserIds) {
              if (!projectMemberUserIds.includes(uid.toString())) {
                return res.status(400).json({
                  success: false,
                  message: `User ${uid} is not a member of project "${project.name}". Cannot assign.`,
                });
              }
            } else {
              const exists = await UserModel.exists({ _id: uid });
              if (!exists) continue;
            }
            if (!sanitized.includes(uid.toString())) {
              sanitized.push(uid.toString());
            }
          }
        }
      }
      task.assignees = sanitized;

      if (sanitized.length > 0) {
        const users = await UserModel.find({ _id: { $in: sanitized } }).select(
          "name"
        );
        task.assignedTo = users.map((u) => u.name).join(", ");
      } else {
        task.assignedTo = "Unassigned";
      }
    }

    // Process & track attachments modification
    let removedAttachmentFileIds = [];
    if (req.body.attachments !== undefined) {
      const oldAttachments = task.attachments || [];
      const oldFileIds = oldAttachments.map((a) => a.fileId).filter(Boolean);

      const sanitizedAttachments = [];
      if (Array.isArray(req.body.attachments)) {
        for (const att of req.body.attachments) {
          if (!att || typeof att !== "object") continue;
          const fileId = att.fileId || att.id;
          const fileName = att.fileName || att.name;
          const fileUrl = att.fileUrl || att.url;
          if (!fileId || !fileName || !fileUrl) continue;

          sanitizedAttachments.push({
            fileId: String(fileId).trim(),
            fileName: String(fileName).trim(),
            name: String(fileName).trim(),
            fileUrl: String(fileUrl).trim(),
            url: String(fileUrl).trim(),
            fileType: att.fileType || att.type || "document",
            type: att.fileType || att.type || "document",
            mimeType: att.mimeType || "",
            fileSize: Number(att.fileSize) || 0,
            thumbnailUrl:
              att.thumbnailUrl || (att.fileType === "image" ? fileUrl : ""),
            uploadedBy: att.uploadedBy || req.user._id,
            uploadedAt: att.uploadedAt || new Date(),
          });
        }
      }

      const newFileIds = new Set(sanitizedAttachments.map((a) => a.fileId));
      removedAttachmentFileIds = oldFileIds.filter((fId) => !newFileIds.has(fId));
      task.attachments = sanitizedAttachments;
    }

    const simpleFields = [
      "description",
      "status",
      "priority",
      "startDate",
      "dueDate",
      "estimatedTime",
      "tags",
      "subtasks",
      "comment",
    ];

    simpleFields.forEach((f) => {
      if (req.body[f] !== undefined) {
        task[f] = req.body[f];
      }
    });

    // Check new mentions if description updated
    if (req.body.description !== undefined) {
      const textMentions = await extractMentions(
        req.body.description,
        projectMemberUserIds
      );
      const existingMentions = (task.mentions || []).map((m) => m.toString());

      textMentions.forEach((mId) => {
        if (!existingMentions.includes(mId)) {
          task.mentions.push(mId);
          // Notify
          if (mId !== req.user._id.toString()) {
            NotificationModel.create({
              recipient: mId,
              sender: req.user._id,
              type: "mention",
              title: "Mentioned in Task",
              message: `${req.user.name} mentioned you in task "${task.title}".`,
              link: `/tasks/${task._id}`,
              relatedProject: project ? project._id : undefined,
              relatedTask: task._id,
            }).catch(console.error);
          }
        }
      });
    }

    await task.save();

    // Clean up removed ImageKit files only after DB save succeeds, and verify no other task references it
    for (const fId of removedAttachmentFileIds) {
      try {
        const refCount = await TaskModel.countDocuments({
          _id: { $ne: task._id },
          "attachments.fileId": fId,
        });
        if (refCount === 0) {
          await safeCleanupFile(fId);
        }
      } catch (cleanErr) {
        console.warn(
          `Could not verify/clean removed ImageKit file ${fId}:`,
          cleanErr.message
        );
      }
    }

    const populated = await TaskModel.findById(task._id)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populated,
      data: populated,
    });
  } catch (error) {
    console.error("updateTask error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating task",
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:taskId
 * @access  Private
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project = task.project ? await ProjectModel.findById(task.project) : null;
    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isProjectManager = project && (
      project.manager?.toString() === req.user._id.toString() ||
      project.owner?.toString() === req.user._id.toString()
    );

    if (!isCreator && !isAdmin && !isProjectManager) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own task, or be an admin/project manager.",
      });
    }

    // Mandatory deletion reason validation (backend independent verification)
    const rawReason = req.body?.reason || req.query?.reason;
    if (!rawReason || typeof rawReason !== "string" || !rawReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "A reason for deletion is mandatory.",
      });
    }

    const trimmedReason = rawReason.trim();
    if (trimmedReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Deletion reason cannot exceed 500 characters.",
      });
    }

    // Persist immutable audit record before permanent deletion
    await AuditLogModel.create({
      action: "TASK_DELETED",
      entityType: "Task",
      taskId: task._id,
      taskTitle: task.title,
      projectId: project ? project._id : (task.project || null),
      projectName: project ? project.name : (task.projectName || "Individual Task"),
      deletedBy: req.user._id,
      deletedByName: req.user.name || req.user.username || "Team Member",
      deletedByEmail: req.user.email || "",
      reason: trimmedReason,
      timestamp: new Date(),
    });

    const taskAttachments = [...(task.attachments || [])];

    await CommentModel.deleteMany({ task: taskId });
    await TaskModel.findByIdAndDelete(taskId);

    // Safely delete associated files from ImageKit if not referenced elsewhere
    for (const att of taskAttachments) {
      if (att.fileId) {
        try {
          const refCount = await TaskModel.countDocuments({
            "attachments.fileId": att.fileId,
          });
          if (refCount === 0) {
            await safeCleanupFile(att.fileId);
          }
        } catch (delErr) {
          console.warn(
            `Could not delete ImageKit file ${att.fileId} on task delete:`,
            delErr.message
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("deleteTask error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error deleting task",
    });
  }
};

/**
 * @desc    Toggle subtask completion
 * @route   PATCH /api/tasks/:taskId/subtasks/:subtaskId
 * @access  Private
 */
export const toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const sub = task.subtasks.id(subtaskId);
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    sub.completed = !sub.completed;
    await task.save();

    const populated = await TaskModel.findById(taskId)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role");

    return res.status(200).json({
      success: true,
      message: "Subtask updated",
      task: populated,
      data: populated,
    });
  } catch (error) {
    console.error("toggleSubtask error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error toggling subtask",
    });
  }
};

/**
 * @desc    Get comments for task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comments = await CommentModel.find({ task: taskId })
      .populate("author", "name email avatar username jobTitle")
      .populate("mentions", "name email avatar username")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
      data: comments,
    });
  } catch (error) {
    console.error("getTaskComments error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching comments",
    });
  }
};

/**
 * @desc    Create comment on task with @mentions
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
export const createTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let project = null;
    let projectMemberUserIds = null;
    if (task.project) {
      project = await ProjectModel.findById(task.project);
      if (!project || !project.isProjectMember(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to comment on this task",
        });
      }

      projectMemberUserIds = [
        project.manager?.toString(),
        project.owner?.toString(),
        ...(project.members || []).map((m) =>
          (m.user?._id || m.user)?.toString()
        ),
      ].filter(Boolean);
    }

    // Extract mentions from comment text
    const textMentions = await extractMentions(
      content,
      projectMemberUserIds
    );
    const combinedMentions = new Set(textMentions);

    if (Array.isArray(mentions)) {
      for (const m of mentions) {
        const mid = typeof m === "string" ? m : m.id || m._id;
        if (mid && mongoose.Types.ObjectId.isValid(mid)) {
          if (projectMemberUserIds) {
            if (projectMemberUserIds.includes(mid.toString())) {
              combinedMentions.add(mid.toString());
            }
          } else {
            const userExists = await UserModel.exists({ _id: mid });
            if (userExists) {
              combinedMentions.add(mid.toString());
            }
          }
        }
      }
    }

    const comment = await CommentModel.create({
      task: task._id,
      project: project ? project._id : null,
      author: req.user._id,
      content: content.trim(),
      mentions: Array.from(combinedMentions),
    });

    // Notify mentioned users
    for (const mentionedId of combinedMentions) {
      if (mentionedId.toString() !== req.user._id.toString()) {
        await NotificationModel.create({
          recipient: mentionedId,
          sender: req.user._id,
          type: "mention",
          title: "Mentioned in Comment",
          message: `${req.user.name} mentioned you on task "${task.title}": "${content.slice(0, 80)}..."`,
          link: `/tasks/${task._id}`,
          relatedProject: project ? project._id : undefined,
          relatedTask: task._id,
        });
      }
    }

    // Notify assignees (if not already mentioned and not author)
    for (const assigneeId of task.assignees || []) {
      const aId = assigneeId.toString();
      if (
        aId !== req.user._id.toString() &&
        !combinedMentions.has(aId)
      ) {
        await NotificationModel.create({
          recipient: aId,
          sender: req.user._id,
          type: "comment",
          title: "New Task Comment",
          message: `${req.user.name} commented on "${task.title}".`,
          link: `/tasks/${task._id}`,
          relatedProject: project ? project._id : undefined,
          relatedTask: task._id,
        });
      }
    }

    const populated = await CommentModel.findById(comment._id)
      .populate("author", "name email avatar username jobTitle")
      .populate("mentions", "name email avatar username");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populated,
      data: populated,
    });
  } catch (error) {
    console.error("createTaskComment error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error posting comment",
    });
  }
};

/**
 * @desc    Delete a comment on a task
 * @route   DELETE /api/tasks/:taskId/comments/:commentId
 * @access  Private
 */
export const deleteTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format",
      });
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Authorization: comment author, admin, or task creator
    if (mongoose.Types.ObjectId.isValid(taskId)) {
      const task = await TaskModel.findById(taskId);
      const isAuthor = comment.author?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      const isTaskCreator = task?.creator?.toString() === req.user._id.toString();

      if (!isAuthor && !isAdmin && !isTaskCreator) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this comment",
        });
      }
    }

    await CommentModel.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentId,
    });
  } catch (error) {
    console.error("deleteTaskComment error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error deleting comment",
    });
  }
};

/**
 * @desc    Clear / delete all comments for a task
 * @route   DELETE /api/tasks/:taskId/comments
 * @access  Private
 */
export const clearTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await CommentModel.deleteMany({ task: taskId });

    return res.status(200).json({
      success: true,
      message: "All discussion activities cleared successfully",
    });
  } catch (error) {
    console.error("clearTaskComments error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error clearing comments",
    });
  }
};

/**
 * @desc    Upload attachments to ImageKit (used by Create Task and Edit Task)
 * @route   POST /api/tasks/attachments/upload
 * @access  Private
 */
export const uploadTaskAttachments = async (req, res) => {
  try {
    const files =
      req.uploadedAttachments ||
      (req.files
        ? Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat()
        : req.file
          ? [req.file]
          : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No files uploaded. Please upload files using field name 'files' or 'file'.",
      });
    }

    const uploadedResults = [];
    const createdFileIds = [];

    try {
      for (const file of files) {
        const result = await uploadImage({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.verifiedMimeType || file.mimetype,
          folder: MEDIA_FOLDERS.ATTACHMENTS,
          tags: ["attachment", "task", req.user._id.toString()],
        });

        createdFileIds.push(result.fileId);

        uploadedResults.push({
          fileId: result.fileId,
          fileName: file.originalname,
          name: file.originalname,
          fileUrl: result.url,
          url: result.url,
          fileType: file.fileCategory || "document",
          type: file.fileCategory || "document",
          mimeType: file.verifiedMimeType || file.mimetype,
          fileSize: file.size || result.size,
          thumbnailUrl:
            result.thumbnailUrl ||
            (file.fileCategory === "image" ? result.url : ""),
          uploadedBy: req.user._id,
          uploadedAt: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        message: `${uploadedResults.length} file(s) uploaded successfully`,
        data: uploadedResults,
        attachments: uploadedResults,
      });
    } catch (uploadError) {
      // Clean up any files successfully uploaded during this batch before failure occurred
      for (const fId of createdFileIds) {
        await safeCleanupFile(fId);
      }
      throw uploadError;
    }
  } catch (error) {
    console.error("uploadTaskAttachments error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to upload attachments",
    });
  }
};

/**
 * @desc    Get all attachments for a specific task
 * @route   GET /api/tasks/:taskId/attachments
 * @access  Private
 */
export const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId)
      .populate("project", "manager owner members")
      .populate("attachments.uploadedBy", "name email avatar username");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Access authorization
    if (task.project && !task.project.isProjectMember(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this task's attachments",
      });
    }

    return res.status(200).json({
      success: true,
      count: task.attachments?.length || 0,
      attachments: task.attachments || [],
      data: task.attachments || [],
    });
  } catch (error) {
    console.error("getTaskAttachments error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving task attachments",
    });
  }
};

/**
 * @desc    Upload & attach files directly to an existing task
 * @route   POST /api/tasks/:taskId/attachments
 * @access  Private (Task Assignee, Creator, Project Manager, or Admin)
 */
export const attachFilesToTask = async (req, res) => {
  let createdFileIds = [];

  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let project = null;
    if (task.project) {
      project = await ProjectModel.findById(task.project);
      if (!project || !project.isProjectMember(req.user._id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to modify tasks in this project",
        });
      }
    }

    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const canManage = project ? project.canManageProject(req.user._id, req.user.role) : false;
    const isAssignee = (task.assignees || []).some(
      (a) => (a?._id || a)?.toString() === req.user._id.toString()
    );

    if (!isAdmin && !canManage && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to attach files to this task",
      });
    }

    const files =
      req.uploadedAttachments ||
      (req.files
        ? Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat()
        : req.file
          ? [req.file]
          : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided to attach",
      });
    }

    const newAttachments = [];

    for (const file of files) {
      const result = await uploadImage({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.verifiedMimeType || file.mimetype,
        folder: MEDIA_FOLDERS.ATTACHMENTS,
        tags: ["attachment", "task", taskId, req.user._id.toString()],
      });

      createdFileIds.push(result.fileId);

      newAttachments.push({
        fileId: result.fileId,
        fileName: file.originalname,
        name: file.originalname,
        fileUrl: result.url,
        url: result.url,
        fileType: file.fileCategory || "document",
        type: file.fileCategory || "document",
        mimeType: file.verifiedMimeType || file.mimetype,
        fileSize: file.size || result.size,
        thumbnailUrl:
          result.thumbnailUrl ||
          (file.fileCategory === "image" ? result.url : ""),
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      });
    }

    // Persist new attachments to Task in database atomically to avoid concurrent save VersionErrors
    if (typeof TaskModel.findByIdAndUpdate === "function") {
      try {
        await TaskModel.findByIdAndUpdate(task._id, {
          $push: { attachments: { $each: newAttachments } },
        });
      } catch {
        task.attachments.push(...newAttachments);
        await task.save();
      }
    } else {
      task.attachments.push(...newAttachments);
      await task.save();
    }

    const populated = await TaskModel.findById(task._id)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username")
      .populate("attachments.uploadedBy", "name email avatar username");

    return res.status(200).json({
      success: true,
      message: `${newAttachments.length} file(s) attached successfully`,
      attachments: populated.attachments,
      task: populated,
    });
  } catch (error) {
    // Two-Phase Rollback: delete ImageKit files if DB save fails
    for (const fId of createdFileIds) {
      await safeCleanupFile(fId);
    }

    console.error("attachFilesToTask error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to attach files to task",
    });
  }
};

/**
 * @desc    Delete a single attachment from a task
 * @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
 * @access  Private (Task Creator, Attachment Uploader, Project Manager, or Admin)
 */
export const deleteTaskAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Find attachment by MongoDB _id or ImageKit fileId
    const targetAttachment = (task.attachments || []).find(
      (a) =>
        a._id?.toString() === attachmentId ||
        a.fileId === attachmentId ||
        a.id === attachmentId
    );

    if (!targetAttachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found on this task",
      });
    }

    // Authorization: Platform Admin, Task Creator, Project Manager/Owner, or the user who uploaded the attachment
    let project = null;
    if (task.project) {
      project = await ProjectModel.findById(task.project);
    }

    const isAdmin = req.user.role === "admin";
    const isTaskCreator = task.creator?.toString() === req.user._id.toString();
    const isProjectManager =
      project &&
      (project.manager?.toString() === req.user._id.toString() ||
        project.owner?.toString() === req.user._id.toString() ||
        (project.canManageProject &&
          project.canManageProject(req.user._id, req.user.role)));
    const isUploader =
      targetAttachment.uploadedBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isTaskCreator && !isProjectManager && !isUploader) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to remove this attachment. Only the uploader, task creator, project manager, or admin can delete it.",
      });
    }

    const fileIdToDelete = targetAttachment.fileId;

    // Remove attachment from task document
    task.attachments = task.attachments.filter(
      (a) => a._id?.toString() !== targetAttachment._id?.toString()
    );

    await task.save();

    // Verify no other task references this ImageKit file before deleting
    if (fileIdToDelete) {
      try {
        const refCount = await TaskModel.countDocuments({
          _id: { $ne: task._id },
          "attachments.fileId": fileIdToDelete,
        });
        if (refCount === 0) {
          await deleteImage(fileIdToDelete);
        }
      } catch (imgKitErr) {
        console.warn(
          `ImageKit deletion failed for attachment ${fileIdToDelete}:`,
          imgKitErr.message
        );
      }
    }

    const populated = await TaskModel.findById(task._id)
      .populate("project", "name key color themeColor status category")
      .populate("creator", "name email avatar username jobTitle")
      .populate("assignees", "name email avatar username jobTitle role")
      .populate("mentions", "name email avatar username")
      .populate("attachments.uploadedBy", "name email avatar username");

    return res.status(200).json({
      success: true,
      message: "Attachment removed successfully",
      attachments: populated.attachments,
      task: populated,
    });
  } catch (error) {
    console.error("deleteTaskAttachment error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error deleting attachment",
    });
  }
};

/**
 * @desc    Delete orphan or pre-uploaded attachment by fileId (e.g. removed in Create Task form before submission)
 * @route   DELETE /api/tasks/attachments/:fileId
 * @access  Private
 */
export const deleteOrphanAttachment = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    // Check if file is linked to any task
    const referencingTask = await TaskModel.findOne({
      "attachments.fileId": fileId,
    });

    if (referencingTask) {
      let project = null;
      if (referencingTask.project) {
        project = await ProjectModel.findById(referencingTask.project);
      }

      const isAdmin = req.user.role === "admin";
      const isTaskCreator =
        referencingTask.creator?.toString() === req.user._id.toString();
      const isProjectManager =
        project &&
        (project.manager?.toString() === req.user._id.toString() ||
          project.owner?.toString() === req.user._id.toString() ||
          (project.canManageProject &&
            project.canManageProject(req.user._id, req.user.role)));
      const targetAtt = referencingTask.attachments.find(
        (a) => a.fileId === fileId
      );
      const isUploader =
        targetAtt?.uploadedBy?.toString() === req.user._id.toString();

      if (!isAdmin && !isTaskCreator && !isProjectManager && !isUploader) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this attachment",
        });
      }

      referencingTask.attachments = referencingTask.attachments.filter(
        (a) => a.fileId !== fileId
      );
      await referencingTask.save();
    }

    // If not referenced in any other task, clean up from ImageKit
    const otherRefCount = await TaskModel.countDocuments({
      "attachments.fileId": fileId,
    });

    if (otherRefCount === 0) {
      await deleteImage(fileId);
    }

    return res.status(200).json({
      success: true,
      message: "Attachment deleted successfully from ImageKit",
    });
  } catch (error) {
    console.error("deleteOrphanAttachment error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete attachment",
    });
  }
};
