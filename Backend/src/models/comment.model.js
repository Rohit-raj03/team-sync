import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    if (ret.author && typeof ret.author === "object") {
      ret.author = {
        id: ret.author._id || ret.author.id,
        _id: ret.author._id || ret.author.id,
        name: ret.author.name,
        email: ret.author.email,
        username: ret.author.username,
        avatar: ret.author.avatar,
        role: ret.author.jobTitle || ret.author.role,
      };
    }
    return ret;
  },
});

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;
