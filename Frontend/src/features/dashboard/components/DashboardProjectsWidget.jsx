import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { useProjects } from "../../projects/hooks/useProjects.js";
import { CreateProjectModal } from "../../projects/components/CreateProjectModal.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { ROUTES } from "../../../shared/constants/routes.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

const STATUS_VARIANTS = {
  ACTIVE: "success",
  IN_PROGRESS: "primary",
  PLANNING: "warning",
  COMPLETED: "default",
};

/**
 * Feature Component: DashboardProjectsWidget
 * Displays active projects directly on the Dashboard with:
 * - Project owner, team members avatars
 * - Task counts (total, completed, pending)
 * - Completion progress bar
 * - Search & Filter
 * - Quick navigation to Project Details
 */
export const DashboardProjectsWidget = () => {
  const navigate = useNavigate();
  const { allProjects, addProject } = useProjects();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    let list = allProjects || [];

    if (filter === "ACTIVE") {
      list = list.filter((p) => p.status === "ACTIVE" || p.status === "IN_PROGRESS");
    } else if (filter === "COMPLETED") {
      list = list.filter((p) => p.status === "COMPLETED" || p.status === "Done");
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allProjects, filter, search]);

  const handleCreate = async (data) => {
    await addProject(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-[#4361EE] flex items-center justify-center shadow-xs">
            <FolderKanban size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Projects Overview
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {allProjects.length} Total
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Track active projects, task completion progress, and allocated team members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.PROJECTS}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#4361EE] hover:text-[#3451DE] px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search projects by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "ALL", label: "All" },
            { id: "ACTIVE", label: "Active" },
            { id: "COMPLETED", label: "Done" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                filter === tab.id
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.slice(0, 4).map((project) => {
            const members = project.members || [];
            const owner =
              members.find((m) => m.role === "Owner") ||
              (project.owner ? { name: project.owner.name || "Owner" } : null);
            const totalTasks = project.tasksCount || 0;
            const completedTasks = project.completedTasksCount || 0;
            const pendingTasks = Math.max(0, totalTasks - completedTasks);
            const progress = project.progress || 0;

            return (
              <div
                key={project.id || project._id}
                onClick={() =>
                  navigate(ROUTES.PROJECT_DETAILS(project.id || project._id))
                }
                className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm bg-white transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs text-xs font-bold"
                      style={{ backgroundColor: project.color || "#4361EE" }}
                    >
                      <FolderKanban size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#4361EE] transition-colors truncate">
                        {project.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {project.category || "General Project"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <Badge variant={STATUS_VARIANTS[project.status] || "default"}>
                      {project.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar & Task Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">
                      Completion Progress
                    </span>
                    <span className="font-bold text-slate-700">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color || "#4361EE",
                      }}
                    />
                  </div>
                </div>

                {/* Task Metrics Count: Completed vs Pending vs Total */}
                <div className="grid grid-cols-3 gap-2 py-1.5 px-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                      Total
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {totalTasks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 block">
                      Done
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {completedTasks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 block">
                      Pending
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      {pendingTasks}
                    </span>
                  </div>
                </div>

                {/* Footer: Owner & Member Stack */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  {/* Owner */}
                  <div className="flex items-center gap-1 text-slate-500 truncate min-w-0 mr-2">
                    <Crown size={12} className="text-purple-600 shrink-0" />
                    <span className="text-[10px] font-semibold text-slate-600 truncate">
                      {owner?.name ? owner.name.split(" ")[0] : "Lead"}
                    </span>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center gap-1 shrink-0">
                    {members.length > 0 ? (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {members.slice(0, 3).map((m) => (
                          <img
                            key={m.id || m._id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.role || "Member"})`}
                            className="w-5 h-5 rounded-full ring-1 ring-white object-cover"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                m.name
                              )}`;
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">0 members</span>
                    )}
                    {members.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400 ml-0.5">
                        +{members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <p className="text-xs font-medium text-slate-500">
            {search
              ? `No projects found matching "${search}".`
              : "No projects created yet."}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs font-bold text-[#4361EE] hover:underline"
          >
            + Create your first project now
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
