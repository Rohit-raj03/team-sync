import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Users,
  Layers,
  Filter,
} from "lucide-react";
import { PageHeader } from "../../shared/components/layout/PageHeader.jsx";
import { ProjectList } from "../../features/projects/components/ProjectList.jsx";
import { CreateProjectModal } from "../../features/projects/components/CreateProjectModal.jsx";
import { useProjects } from "../../features/projects/hooks/useProjects.js";
import { ROUTES } from "../../shared/constants/routes.js";

/**
 * Presentation Layer: ProjectsPage
 * Layer: pages/projects/
 * Responsibility: Projects hub with high-level statistics, filter/search controls, project cards, and creation modal.
 */
export const ProjectsPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    allProjects,
    filter,
    search,
    setFilter,
    setSearch,
    addProject,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (data) => {
    addProject(data);
    setIsModalOpen(false);
  };

  // Metrics
  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter(
    (p) => p.status === "ACTIVE",
  ).length;
  const totalTasks = allProjects.reduce(
    (acc, p) => acc + (p.tasksCount || 0),
    0,
  );
  const totalMembers = new Set(
    allProjects.flatMap((p) => (p.members ? p.members.map((m) => m.id) : [])),
  ).size;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Projects"
        subtitle="Organize initiatives, tag contributors, and connect milestone tasks."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        }
      />

      {/* 2. Project Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <FolderKanban size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalProjects}</p>
          <p className="text-xs font-medium text-slate-400">
            Total Initiatives
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeProjects}</p>
          <p className="text-xs font-medium text-slate-400">
            Active Workspaces
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Layers size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
          <p className="text-xs font-medium text-slate-400">Connected Tasks</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Users size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
          <p className="text-xs font-medium text-slate-400">
            Tagged Contributors
          </p>
        </div>
      </div>

      {/* 3. Search and Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search projects by title, category, or tagged member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto text-xs font-semibold">
          {[
            { id: "ALL", label: "All Projects" },
            { id: "ACTIVE", label: "Active" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "PLANNING", label: "Planning" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                filter === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Projects Grid */}
      <ProjectList
        projects={projects}
        onProjectClick={(p) => navigate(ROUTES.PROJECT_DETAILS(p.id || p._id))}
        onCreateClick={() => setIsModalOpen(true)}
      />

      {/* 5. Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default ProjectsPage;
