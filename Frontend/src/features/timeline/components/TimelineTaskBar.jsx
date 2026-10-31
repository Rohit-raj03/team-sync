import React, { useRef } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";

/**
 * Feature Component: TimelineTaskBar
 * Layer: features/timeline/components/
 * Responsibility: Renders a single horizontal Gantt task bar that strictly inherits
 * its color and styling tokens from its parent project.
 */
export const TimelineTaskBar = ({
  task,
  colorTokens,
  projectName,
  onClick,
  onHoverStart,
  onHoverEnd,
}) => {
  const barRef = useRef(null);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const isCompleted = task.status === "COMPLETED" || task.status === "Done";
  const progress =
    task.progress !== undefined
      ? task.progress
      : subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : isCompleted
      ? 100
      : 30;

  // Primary assignee
  const assignees = Array.isArray(task.assignees) && task.assignees.length > 0
    ? task.assignees
    : task.assignedTo
    ? [{ name: task.assignedTo }]
    : [];
  const primaryAssignee = assignees[0];

  const handleMouseEnter = () => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      onHoverStart?.(task, colorTokens, projectName, rect);
    }
  };

  const handleFocus = () => {
    handleMouseEnter();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(task);
    }
  };

  return (
    <div
      ref={barRef}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}, Project: ${projectName}, Status: ${task.status}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHoverEnd}
      onFocus={handleFocus}
      onBlur={onHoverEnd}
      onKeyDown={handleKeyDown}
      style={{
        left: `${task.leftPercent}%`,
        width: `${task.widthPercent}%`,
        minWidth: "48px",
        background: colorTokens.gradient,
        color: colorTokens.textColor,
        boxShadow: colorTokens.glow,
      }}
      className="absolute inset-y-0 rounded-xl cursor-pointer select-none px-3 flex items-center justify-between gap-2 overflow-hidden transition-all duration-150 hover:brightness-105 hover:shadow-lg active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 group z-10 hover:z-20"
    >
      {/* Subtle Progress Fill Indicator */}
      {progress > 0 && (
        <div
          className="absolute inset-y-0 left-0 pointer-events-none transition-all duration-300 opacity-25"
          style={{
            width: `${progress}%`,
            backgroundColor: "#FFFFFF",
          }}
        />
      )}

      {/* Left: Completed Icon or Mini Status + Title */}
      <div className="relative z-10 flex items-center gap-1.5 min-w-0 flex-1 pointer-events-none">
        {isCompleted ? (
          <Check
            size={13}
            className="shrink-0 stroke-[2.5]"
            style={{ color: colorTokens.textColor }}
          />
        ) : null}

        <p
          className="text-xs font-bold truncate tracking-tight"
          style={{ color: colorTokens.textColor }}
        >
          {task.title}
        </p>
      </div>

      {/* Right: Progress % + Assignee Avatar */}
      <div className="relative z-10 flex items-center gap-1.5 shrink-0 pointer-events-none">
        {task.widthPercent > 12 && (
          <span
            className="text-[10px] font-semibold tracking-tighter opacity-90 hidden sm:inline-block"
            style={{ color: colorTokens.textSubtle }}
          >
            {progress}%
          </span>
        )}

        {primaryAssignee && (
          <Avatar
            src={primaryAssignee.avatar}
            name={primaryAssignee.name}
            size="xs"
            className="w-5.5 h-5.5 text-[9px] shadow-2xs shrink-0"
            style={{
              borderColor: colorTokens.avatarBorder,
              borderWidth: "1.5px",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineTaskBar;
