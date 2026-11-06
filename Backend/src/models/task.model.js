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

const formatBytesHelper = (bytes) => {
  if (!bytes || isNaN(bytes)) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || "B"}`;
};

const attachmentSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: [true, "ImageKit fileId is required"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "Attachment fileName is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "Attachment fileUrl is required"],
      trim: true,
    },
    fileType: {
      type: String,
      default: "document",
    },
    mimeType: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    // Backwards compatibility legacy fields
    name: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "document",
    },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validate hook to sync modern and legacy fields
attachmentSchema.pre("validate", function (next) {
  if (!this.fileName && this.name) {
    this.fileName = this.name;
  }
  if (!this.name && this.fileName) {
    this.name = this.fileName;
  }
  if (!this.fileUrl && this.url) {
    this.fileUrl = this.url;
  }
  if (!this.url && this.fileUrl) {
    this.url = this.fileUrl;
  }
  if (!this.fileType && this.type) {
    this.fileType = this.type;
  }
  if (!this.type && this.fileType) {
    this.type = this.fileType;
  }
  if (this.fileSize && !this.size) {
    this.size = formatBytesHelper(this.fileSize);
  }
  next();
});

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
    if (Array.isArray(ret.subtasks)) {
      ret.subtasks = ret.subtasks.map((s, idx) => {
        const sId = s._id ? s._id.toString() : s.id || `st-${idx}`;
        return {
          id: sId,
          _id: sId,
          title: s.title || "",
          completed: Boolean(s.completed),
        };
      });
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
    if (Array.isArray(ret.attachments)) {
      ret.attachments = ret.attachments.map((att, idx) => {
        const attId = att._id ? att._id.toString() : att.id || `att-${idx}`;
        const fSize = typeof att.fileSize === "number" ? att.fileSize : 0;
        const formattedSize = att.size || (fSize ? formatBytesHelper(fSize) : "");
        const fName = att.fileName || att.name || "attachment";
        const fUrl = att.fileUrl || att.url || "";
        const fType = att.fileType || att.type || "document";
        return {
          id: attId,
          _id: attId,
          fileId: att.fileId || "",
          fileName: fName,
          name: fName,
          fileUrl: fUrl,
          url: fUrl,
          fileType: fType,
          type: fType,
          mimeType: att.mimeType || "",
          fileSize: fSize,
          size: formattedSize,
          thumbnailUrl: att.thumbnailUrl || (fType === "image" ? fUrl : ""),
          uploadedBy: att.uploadedBy,
          uploadedAt: att.uploadedAt || new Date(),
        };
      });
    }
    return ret;
  },
});

const TaskModel = mongoose.model("Task", taskSchema);

export default TaskModel;
