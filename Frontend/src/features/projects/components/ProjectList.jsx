import React from "react";
import { FolderKanban } from "lucide-react";
import { ProjectCard } from "./ProjectCard.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";

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
      <EmptyState
        icon={FolderKanban}
        title="No projects found"
        description="Try adjusting your search criteria or create your first team project to get started."
        actionText={onCreateClick ? "Create New Project" : undefined}
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id || p._id} project={p} onClick={onProjectClick} />
      ))}
    </div>
  );
};

export default ProjectList;
