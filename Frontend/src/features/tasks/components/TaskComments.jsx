import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Sparkles, User } from "lucide-react";
import { MentionTextarea } from "./MentionTextarea.jsx";
import { MentionRenderer } from "./MentionRenderer.jsx";
import { taskService } from "../services/task.service.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Feature Component: TaskComments
 * Interactive comments list and submission form with @mention autocomplete
 */
export const TaskComments = ({ taskId, projectMembers = [] }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [mentionsList, setMentionsList] = useState([]);
  const [error, setError] = useState("");

  // Fetch comments for this task
  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      if (!taskId) return;
      try {
        setLoading(true);
        const res = await taskService.getTaskComments(taskId);
        if (isMounted && res?.comments) {
          setComments(res.comments);
        }
      } catch (err) {
        console.warn("Could not load comments from server:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const res = await taskService.createTaskComment(taskId, {
        content: commentText.trim(),
        mentions: mentionsList,
      });

      const newComment = res?.comment || res?.data;
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }

      setCommentText("");
      setMentionsList([]);
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#4361EE]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Discussion & Activity ({comments.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Type @ to mention team members
        </span>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-[#4361EE]" />
          <span>Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const author = comment.author || {};
            const authorName = author.name || "Team Member";
            return (
              <div
                key={comment.id || comment._id}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 transition-all hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        author.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`
                      }
                      alt={authorName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {authorName}
                    </span>
                    {author.role && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        • {author.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(comment.createdAt || new Date())}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-line">
                  <MentionRenderer text={comment.content} />
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-slate-50/60 rounded-2xl text-center border border-dashed border-slate-200">
          <p className="text-xs text-slate-400">
            No comments yet. Start the conversation by leaving a note or mentioning a teammate!
          </p>
        </div>
      )}

      {/* New Comment Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        )}

        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <MentionTextarea
              value={commentText}
              onChange={(newText, mentions) => {
                setCommentText(newText);
                setMentionsList(mentions);
              }}
              projectMembers={projectMembers}
              placeholder="Write a comment or update... Use @ to notify teammates"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="px-4 py-2.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5 shrink-0 self-end"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
