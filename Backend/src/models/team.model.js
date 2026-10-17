import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    logoFileId: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team owner is required"],
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member", "lead"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Helpful helper to check if a user is an authorized admin/owner of this team
teamSchema.methods.canManageTeam = function (userId, userRole) {
  if (userRole === "admin") return true;
  if (this.owner && this.owner.toString() === userId.toString()) return true;
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );
  return Boolean(member);
};

const TeamModel = mongoose.model("Team", teamSchema);

export default TeamModel;

