import React from 'react';
import { ProjectCard } from './ProjectCard.jsx';

export const ProjectList = ({ projects, onProjectClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onClick={() => onProjectClick?.(p)} />
      ))}
    </div>
  );
};
