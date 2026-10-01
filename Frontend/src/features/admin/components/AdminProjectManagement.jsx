import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  Archive,
  ExternalLink,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { ROUTES } from '../../../shared/constants/routes.js';
import { AdminConfirmationModal } from './AdminConfirmationModal.jsx';
import { formatDate } from '../../../shared/utils/formatDate.js';

/**
 * Feature Component: AdminProjectManagement
 * Layer: features/admin/components/
 * Responsibility: Administrative project overview table with archive, delete, member audits, and status monitoring.
 */
export const AdminProjectManagement = ({
  projects = [],
  onDeleteProject,
  onOpenCreateProject,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const promptDelete = (project) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Project: ${project.name}?`,
      message: `Are you sure you want to permanently delete this project? All associated tasks, milestones, and member allocations will be removed.`,
      confirmLabel: 'Delete Project Permanently',
      onConfirm: () => onDeleteProject(project.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Project Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversee organizational initiatives, deliverable health, and lead assignments.
          </p>
        </div>

        {onOpenCreateProject && (
          <button
            onClick={onOpenCreateProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search projects by name, category, or scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {['ALL', 'ACTIVE', 'IN_PROGRESS', 'PLANNING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#4361EE] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'ACTIVE'
                ? 'Active'
                : st === 'IN_PROGRESS'
                ? 'In Progress'
                : st === 'PLANNING'
                ? 'Planning'
                : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Project Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Project Name & Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timeline Due</th>
                <th className="py-3.5 px-4">Tagged Members</th>
                <th className="py-3.5 px-4">Task Velocity</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const progress = project.progress || 0;
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
                            style={{ backgroundColor: project.color || '#4361EE' }}
                          >
                            <FolderKanban size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {project.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {project.category || 'Initiative'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            project.status === 'ACTIVE'
                              ? 'success'
                              : project.status === 'IN_PROGRESS'
                              ? 'primary'
                              : 'default'
                          }
                        >
                          {project.status?.replace('_', ' ')}
                        </Badge>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {project.dueDate ? formatDate(project.dueDate) : 'No due date'}
                      </td>

                      {/* Tagged Members Stack */}
                      <td className="py-3.5 px-4">
                        {project.members && project.members.length > 0 ? (
                          <div className="flex items-center">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {project.members.slice(0, 3).map((m) => (
                                <img
                                  key={m.id}
                                  src={m.avatar}
                                  alt={m.name}
                                  title={m.name}
                                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                                  onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`;
                                  }}
                                />
                              ))}
                            </div>
                            <span className="ml-1 text-[11px] text-slate-500 font-medium">
                              ({project.members.length})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">0 members</span>
                        )}
                      </td>

                      {/* Task Velocity */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {project.completedTasksCount || 0} / {project.tasksCount || 0} done
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-700">
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: project.color || '#4361EE',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.PROJECT_DETAILS(project.id))}
                            title="Open Project Workspace"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-indigo-50 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => promptDelete(project)}
                            title="Delete Project"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No projects found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

