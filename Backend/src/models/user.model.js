import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member",
    },

    jobTitle: {
      type: String,
      default: "Team Member",
    },

    phone: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "Remote",
    },

    timezone: {
      type: String,
      default: "UTC (GMT+0:00)",
    },

    avatar: {
      type: String,
      default: "",
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Password hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Login 
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;