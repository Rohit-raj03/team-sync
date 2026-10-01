import React from "react";
import { ProjectCard } from "./ProjectCard.jsx";
import { FolderKanban, Plus } from "lucide-react";

/**
 * Feature Component: ProjectList
 * Layer: features/projects/components/
 * Responsibility: Renders grid of project cards with empty state when no projects match.
 */
export const ProjectList = ({
  projects = [],
  onProjectClick,
  onCreateClick,
}) => {
  if (projects.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4361EE] mx-auto flex items-center justify-center">
          <FolderKanban size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            No projects found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create your first team project
            to get started.
          </p>
        </div>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>Create New Project</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onClick={onProjectClick} />
      ))}
    </div>
  );
};
