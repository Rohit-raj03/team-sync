import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      default: "TASK_DELETED",
    },
    entityType: {
      type: String,
      required: true,
      default: "Task",
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    projectName: {
      type: String,
      default: "Individual Task",
      trim: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedByName: {
      type: String,
      default: "",
      trim: true,
    },
    deletedByEmail: {
      type: String,
      default: "",
      trim: true,
    },
    reason: {
      type: String,
      required: [true, "A deletion reason is mandatory."],
      trim: true,
      maxlength: [500, "Deletion reason cannot exceed 500 characters."],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

auditLogSchema.index({ taskId: 1 });
auditLogSchema.index({ deletedBy: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);

export default AuditLogModel;
