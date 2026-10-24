import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Owner", "Admin", "Member", "Viewer"],
      default: "Member",
    },
    projectRole: {
      type: String,
      default: "Contributor",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    key: {
      type: String,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "Web Application",
    },
    status: {
      type: String,
      enum: [
        "PLANNING",
        "ACTIVE",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "ARCHIVED",
        "Planning",
        "Active",
        "In Progress",
        "On Hold",
        "Completed",
        "Archived",
      ],
      default: "ACTIVE",
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
    },
    color: {
      type: String,
      default: "#4361EE",
    },
    themeColor: {
      type: String,
      default: "#4361EE",
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project manager is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [projectMemberSchema],
    coverImage: {
      type: String,
      default: "",
    },
    coverImageFileId: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    budget: {
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

// Keep manager and owner in sync before saving
projectSchema.pre("save", function (next) {
  if (this.manager && !this.owner) {
    this.owner = this.manager;
  } else if (this.owner && !this.manager) {
    this.manager = this.owner;
  }

  if (this.dueDate && !this.endDate) {
    this.endDate = this.dueDate;
  } else if (this.endDate && !this.dueDate) {
    this.dueDate = this.endDate;
  }

  if (this.color && !this.themeColor) {
    this.themeColor = this.color;
  } else if (this.themeColor && !this.color) {
    this.color = this.themeColor;
  }

  next();
});

// Check if user has management permissions (admin, owner/manager, or project Admin)
projectSchema.methods.canManageProject = function (userId, userRole) {
  if (userRole === "admin") return true;
  const uid = userId.toString();
  const managerId = this.manager?._id?.toString() || this.manager?.toString();
  const ownerId = this.owner?._id?.toString() || this.owner?.toString();
  if (managerId === uid || ownerId === uid) return true;

  if (Array.isArray(this.members)) {
    const member = this.members.find((m) => {
      const mUserId = m.user?._id?.toString() || m.user?.toString();
      return mUserId === uid && (m.role === "Owner" || m.role === "Admin");
    });
    if (member) return true;
  }
  return false;
};

// Check if user is a member of this project
projectSchema.methods.isProjectMember = function (userId, userRole) {
  if (userRole === "admin") return true;
  const uid = userId.toString();
  const managerId = this.manager?._id?.toString() || this.manager?.toString();
  const ownerId = this.owner?._id?.toString() || this.owner?.toString();
  if (managerId === uid || ownerId === uid) return true;

  if (Array.isArray(this.members)) {
    return this.members.some((m) => {
      const mUserId = m.user?._id?.toString() || m.user?.toString();
      return mUserId === uid;
    });
  }
  return false;
};

// Transform output JSON so frontend receives clean identifiers and populated member fields
projectSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.themeColor = ret.themeColor || ret.color || "#4361EE";
    ret.color = ret.color || ret.themeColor || "#4361EE";
    if (Array.isArray(ret.members)) {
      ret.members = ret.members.map((m) => {
        if (m.user && typeof m.user === "object") {
          return {
            id: m.user._id || m.user.id,
            _id: m.user._id || m.user.id,
            name: m.user.name,
            email: m.user.email,
            username: m.user.username,
            avatar: m.user.avatar,
            role: m.role || "Member",
            projectRole: m.projectRole || m.role || "Contributor",
            tags:
              Array.isArray(m.tags) && m.tags.length > 0
                ? m.tags
                : m.projectRole
                ? [m.projectRole]
                : ["Contributor"],
            joinedAt: m.joinedAt,
            user: m.user,
          };
        }
        return m;
      });
    }
    return ret;
  },
});

const ProjectModel = mongoose.model("Project", projectSchema);

export default ProjectModel;
