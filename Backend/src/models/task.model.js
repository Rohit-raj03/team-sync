import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: String, default: "" },
    url: { type: String, default: "" },
    type: { type: String, default: "document" },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
      default: null,
      index: true,
    },
    projectName: {
      type: String,
      default: "Individual Task",
    },
    isIndividual: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "COMPLETED",
        "Todo",
        "To Do",
        "In Progress",
        "In Review",
        "Review",
        "Done",
      ],
      default: "TODO",
      index: true,
    },
    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
        "Low",
        "Medium",
        "High",
        "Urgent",
      ],
      default: "MEDIUM",
      index: true,
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    estimatedTime: {
      type: String,
      default: "8h",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedTo: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    subtasks: [subtaskSchema],
    attachments: [attachmentSchema],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comment: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subtasks progress percentage
taskSchema.virtual("progress").get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === "COMPLETED" || this.status === "Done" ? 100 : 0;
  }
  const completed = this.subtasks.filter((s) => s.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// toJSON transform for frontend compatibility
taskSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    if (ret.project) {
      ret.projectId = ret.project._id ? ret.project._id.toString() : ret.project.toString();
      if (ret.project.name && !ret.projectName) {
        ret.projectName = ret.project.name;
      }
    } else {
      ret.projectId = null;
      if (!ret.projectName) {
        ret.projectName = "Individual Task";
      }
    }
    if (Array.isArray(ret.assignees)) {
      ret.assignees = ret.assignees.map((a) => {
        if (a && typeof a === "object" && (a._id || a.id)) {
          return {
            id: a._id || a.id,
            _id: a._id || a.id,
            name: a.name,
            email: a.email,
            username: a.username,
            avatar: a.avatar,
            role: a.jobTitle || a.role || "Member",
          };
        }
        return a;
      });
    }
    return ret;
  },
});

const TaskModel = mongoose.model("Task", taskSchema);

export default TaskModel;
