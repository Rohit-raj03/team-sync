import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { ROUTES } from "../../../shared/constants/routes.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

const STATUS_VARIANTS = {
  ACTIVE: "success",
  IN_PROGRESS: "primary",
  PLANNING: "warning",
  COMPLETED: "default",
};

const PRIORITY_VARIANTS = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "danger",
  URGENT: "danger",
};

/**
 * Feature Component: ProjectCard
 * Layer: features/projects/components/
 * Responsibility: Displays single project card with status, category, tagged member avatars, linked task metrics, and progress indicator.
 */
export const ProjectCard = ({ project, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(project);
    } else {
      navigate(ROUTES.PROJECT_DETAILS(project.id));
    }
  };

  const members = project.members || [];
  const progress = project.progress || 0;

  return (
    <div
      onClick={handleClick}
      className="p-6 bg-white rounded-3xl border border-slate-100/90 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Header badges & icon */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: project.color || "#4361EE" }}
            >
              <FolderKanban size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {project.category || "General Project"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={STATUS_VARIANTS[project.status] || "default"}>
                  {project.status?.replace("_", " ")}
                </Badge>
                {project.priority && (
                  <Badge
                    variant={PRIORITY_VARIANTS[project.priority] || "default"}
                  >
                    {project.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-[#4361EE] group-hover:translate-x-1 transition-all"
          />
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#4361EE] transition-colors line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {project.description || "No description provided for this project."}
        </p>

        {/* Progress Bar & Connected Task Metric */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">
              Connected Tasks
            </span>
            <span className="font-bold text-slate-700">
              {project.completedTasksCount || 0}/{project.tasksCount || 0}{" "}
              <span className="text-[#4361EE]">({progress}%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: project.color || "#4361EE",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Tagged Members & Due Date */}
      <div className="mt-5 pt-4 border-t border-slate-100/90 flex items-center justify-between text-xs">
        {/* Tagged Members Avatar Stack */}
        <div className="flex items-center gap-2">
          {members.length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2 overflow-hidden">
                {members.slice(0, 4).map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={m.name}
                    title={`${m.name} (${m.projectRole || m.role || "Member"})`}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`;
                    }}
                  />
                ))}
              </div>
              {members.length > 4 && (
                <span className="ml-1 text-[11px] font-bold text-slate-400">
                  +{members.length - 4}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              No members tagged
            </span>
          )}
        </div>

        {/* Target Deadline */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Calendar size={13} />
          <span>
            {project.dueDate ? formatDate(project.dueDate) : "No due date"}
          </span>
        </div>
      </div>
    </div>
  );
};
