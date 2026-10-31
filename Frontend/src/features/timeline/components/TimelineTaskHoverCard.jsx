import React, { useMemo, useRef } from "react";
import {
  Calendar,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Check,
} from "lucide-react";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import {
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from "../../tasks/utils/taskHelpers.js";

/**
 * Feature Component: TimelineTaskHoverCard
 * Layer: features/timeline/components/
 * Responsibility: Compact, floating task overview card that renders on hover.
 * Positioned intelligently to prevent viewport overflow with zero flickering.
 */
export const TimelineTaskHoverCard = ({
  task,
  colorTokens,
  projectName = "Individual Task",
  anchorRect,
  onOpenDetails,
  onMouseEnter,
  onMouseLeave,
}) => {
  const cardRef = useRef(null);

  const coords = useMemo(() => {
    if (!anchorRect) return { top: -9999, left: -9999 };

    const CARD_WIDTH = 340;
    const CARD_HEIGHT = 280;
    const GAP = 12;
    const padding = 12;

    const viewportW =
      typeof window !== "undefined" ? window.innerWidth : 1200;
    const viewportH =
      typeof window !== "undefined" ? window.innerHeight : 800;

    // Ideal: position centered horizontally above anchorRect
    let left = anchorRect.left + anchorRect.width / 2 - CARD_WIDTH / 2;
    if (left + CARD_WIDTH > viewportW - padding) {
      left = viewportW - CARD_WIDTH - padding;
    }
    if (left < padding) {
      left = padding;
    }

    // Determine vertical position: prefer above, flip below if not enough space
    const spaceAbove = anchorRect.top - padding;
    const spaceBelow = viewportH - anchorRect.bottom - padding;

    let top;
    if (spaceAbove >= CARD_HEIGHT + GAP) {
      top = anchorRect.top - CARD_HEIGHT - GAP;
    } else if (spaceBelow >= CARD_HEIGHT + GAP) {
      top = anchorRect.bottom + GAP;
    } else {
      if (spaceAbove >= spaceBelow) {
        top = Math.max(padding, anchorRect.top - CARD_HEIGHT - GAP);
      } else {
        top = Math.min(
          viewportH - CARD_HEIGHT - padding,
          anchorRect.bottom + GAP
        );
      }
    }

    return { top, left };
  }, [anchorRect]);

  if (!task) return null;

  // Compute progress
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const progress =
    task.progress !== undefined
      ? task.progress
      : subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : task.status === "COMPLETED" || task.status === "Done"
      ? 100
      : 30;

  // Assignees list
  const assignees = Array.isArray(task.assignees) && task.assignees.length > 0
    ? task.assignees
    : task.assignedTo
    ? [{ name: task.assignedTo }]
    : [];

  const creatorName = task.creator?.name || task.creator?.username || null;

  return (
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onOpenDetails?.(task);
      }}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: "340px",
        zIndex: 60,
      }}
      className="bg-white/95 backdrop-blur-md rounded-2xl p-4.5 border border-slate-200/90 shadow-[0_20px_45px_-12px_rgba(15,23,42,0.18)] cursor-pointer select-none animate-in fade-in zoom-in-95 duration-150 transition-all hover:border-indigo-300"
    >
      {/* Top Header: Project indicator + Status & Priority */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: colorTokens?.primary || "#4361EE" }}
          />
          <span
            className="text-xs font-bold text-slate-800 truncate"
            title={projectName}
          >
            {projectName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            variant={getStatusBadgeVariant(task.status)}
            className="text-[10px] py-0 px-2 uppercase font-semibold"
          >
            {task.status?.replace("_", " ") || "TODO"}
          </Badge>
          <Badge
            variant={getPriorityBadgeVariant(task.priority)}
            className="text-[10px] py-0 px-2 uppercase font-semibold"
          >
            {task.priority || "MEDIUM"}
          </Badge>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-sm text-slate-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Short Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-slate-400" />
            Progress
          </span>
          <span className="font-bold text-slate-800">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: colorTokens?.primary || "#4361EE",
            }}
          />
        </div>
      </div>

      {/* Dates Info */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100/80 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Start:</span>
          <span className="font-medium text-slate-700 truncate">
            {task.startDate ? formatDate(task.startDate) : "Not set"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Due:</span>
          <span className="font-medium text-slate-700 truncate">
            {task.dueDate ? formatDate(task.dueDate) : "Not set"}
          </span>
        </div>
      </div>

      {/* Assignees & Creator */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-1.5">
          {assignees.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {assignees.slice(0, 3).map((a, idx) => (
                <Avatar
                  key={idx}
                  src={a.avatar}
                  name={a.name}
                  size="xs"
                  className="w-5 h-5 text-[9px] border-2 border-white shadow-2xs"
                />
              ))}
              {assignees.length > 3 && (
                <span className="w-5 h-5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 flex items-center justify-center border-2 border-white">
                  +{assignees.length - 3}
                </span>
              )}
              <span className="text-xs text-slate-600 font-medium ml-2">
                {assignees[0]?.name || "Assignee"}
                {assignees.length > 1 && ` +${assignees.length - 1}`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Unassigned
            </span>
          )}
        </div>

        {creatorName && (
          <span
            className="text-[10px] text-slate-400 truncate max-w-28"
            title={`Created by ${creatorName}`}
          >
            By {creatorName}
          </span>
        )}
      </div>

      {/* Hint Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/60 text-[10px] text-indigo-600 font-medium">
        <span>Click to open full task details</span>
        <ExternalLink size={11} />
      </div>
    </div>
  );
};

export default TimelineTaskHoverCard;
