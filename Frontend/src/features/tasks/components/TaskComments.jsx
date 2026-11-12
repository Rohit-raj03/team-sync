import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MentionTextarea } from "./MentionTextarea.jsx";
import { MentionRenderer } from "./MentionRenderer.jsx";
import { taskService } from "../services/task.service.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Feature Component: TaskComments
 * Interactive comments list and submission form with @mention autocomplete and delete capabilities
 */
export const TaskComments = ({ taskId, projectMembers = [] }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleDeleteComment = async (commentId, e) => {
    e?.stopPropagation();
    if (!commentId || deletingId) return;

    try {
      setDeletingId(commentId);
      await taskService.deleteTaskComment(taskId, commentId);
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== commentId));
    } catch (err) {
      console.warn("Error deleting comment:", err.message);
      // Fallback optimistic update
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== commentId));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async (e) => {
    e?.stopPropagation();
    if (!comments.length || isClearing) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all discussion activity from this task?"
    );
    if (!confirmed) return;

    try {
      setIsClearing(true);
      await taskService.clearTaskComments(taskId);
      setComments([]);
    } catch (err) {
      console.warn("Error clearing comments:", err.message);
      setComments([]);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Discussion & Activity ({comments.length})
          </h4>
        </div>

        <div className="flex items-center gap-2.5">
          {comments.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors font-semibold cursor-pointer disabled:opacity-50 border border-rose-100"
              title="Delete all comments in this discussion"
            >
              {isClearing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              <span>Clear Activity</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Type @ to mention team members
          </span>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expand discussion" : "Collapse discussion"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Comments List */}
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const commentId = comment.id || comment._id;
                const author = comment.author || {};
                const authorName = author.name || "Team Member";
                const isDeleting = deletingId === commentId;

                return (
                  <div
                    key={commentId}
                    className="group p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 transition-all hover:bg-slate-50 hover:border-slate-200 relative"
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

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(comment.createdAt || new Date())}
                        </span>

                        {/* Delete single comment button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteComment(commentId, e)}
                          disabled={isDeleting}
                          title="Delete this comment"
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100 cursor-pointer"
                        >
                          {isDeleting ? (
                            <Loader2 size={12} className="animate-spin text-rose-500" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
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
                className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5 shrink-0 self-end cursor-pointer"
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
        </>
      )}
    </div>
  );
};

export default TaskComments;
