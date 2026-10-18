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
      enum: ["admin", "user", "member", "manager"],
      default: "user",
    },

    jobTitle: {
      type: String,
      default: "Team Member",
    },

    phone: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return !v || (v.length >= 10 && v.length <= 15);
        },
        message: "Phone number must be between 10 and 15 digits",
      },
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

    avatarFileId: {
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

    refreshToken: {
      type: String,
      default: "",
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

// Compare password for login verification
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Automatically omit sensitive credentials when serializing to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
