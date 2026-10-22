import mongoose from "mongoose";
import TaskModel from "../models/task.model.js";
import ProjectModel from "../models/project.model.js";
import UserModel from "../models/user.model.js";
import CommentModel from "../models/comment.model.js";
import NotificationModel from "../models/notification.model.js";

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
      .populate("project", "name key color status category")
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
      .populate("project", "name key color status category manager owner members")
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
      attachments: Array.isArray(attachments) ? attachments : [],
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
      .populate("project", "name key color status category")
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

    const simpleFields = [
      "title",
      "description",
      "status",
      "priority",
      "startDate",
      "dueDate",
      "estimatedTime",
      "tags",
      "subtasks",
      "attachments",
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

    const populated = await TaskModel.findById(task._id)
      .populate("project", "name key color status category")
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

    await CommentModel.deleteMany({ task: taskId });
    await TaskModel.findByIdAndDelete(taskId);

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
      .populate("project", "name key color status category")
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
