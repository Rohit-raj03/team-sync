import React from 'react';
import { FolderKanban, CheckCircle2, Users, ArrowUpRight, Calendar } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

/**
 * Feature Component: AdminProjectProgress
 * Layer: features/admin/components/
 * Responsibility: Displays active project status distribution, completion progress bars, and recent initiatives overview.
 */
export const AdminProjectProgress = ({ projects = [], onProjectClick }) => {
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Project Health & Progress Overview
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active deliverable completion across all workspaces
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const progress = project.progress || 0;
          return (
            <div
              key={project.id}
              onClick={() => onProjectClick?.(project.id)}
              className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-150/70 transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-xs"
                    style={{ backgroundColor: project.color || '#4361EE' }}
                  >
                    <FolderKanban size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {project.category || 'Initiative'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-800">
                    {progress}%
                  </span>
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
                    {project.status}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: project.color || '#4361EE',
                  }}
                />
              </div>

              {/* Footer Details */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{project.completedTasksCount || 0} of {project.tasksCount || 0} tasks done</span>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{project.members?.length || 0} contributors</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

