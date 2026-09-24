import React from 'react';
import { FolderKanban, Users, CheckCircle } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

export const ProjectCard = ({ project, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <FolderKanban size={20} />
        </div>
        <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
          {project.status}
        </Badge>
      </div>

      <h3 className="text-base font-bold text-slate-800">{project.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>

      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{project.membersCount || 0} Members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} />
          <span>{project.tasksCount || 0} Tasks</span>
        </div>
      </div>
    </div>
  );
};
