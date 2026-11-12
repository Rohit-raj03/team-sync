import React, { useState, useMemo } from 'react';
import {

  Search,
  Plus,
  Trash2,






  Eye,

} from 'lucide-react';

import { formatDate, formatDateForInput } from '../../../shared/utils/formatDate.js';

import { AdminConfirmationModal } from './AdminConfirmationModal.jsx';

/**
 * Feature Component: AdminTaskManagement
 * Layer: features/admin/components/
 * Responsibility: Complete administrative task oversight table with overdue filtering, inline status & priority updates, and deletion.
 */
export const AdminTaskManagement = ({
  tasks = [],
  onUpdateTask,
  onDeleteTask,
  onOpenCreateTask,
  onOpenTaskDetails,
  initialFilter = 'ALL',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const todayStr = formatDateForInput(new Date());

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q) ||
        t.projectName?.toLowerCase().includes(q);

      const isDone = t.status === 'COMPLETED' || t.status === 'Done';
      const isOverdue = !isDone && t.dueDate && t.dueDate < todayStr;

      let matchesStatus = true;
      if (statusFilter === 'OVERDUE') {
        matchesStatus = isOverdue;
      } else if (statusFilter !== 'ALL') {
        matchesStatus = t.status === statusFilter;
      }

      const matchesPriority =
        priorityFilter === 'ALL' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, todayStr]);

  const handleQuickStatus = (task, newStatus) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleQuickPriority = (task, newPriority) => {
    onUpdateTask({ ...task, priority: newPriority });
  };

  const promptDelete = (task) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Task: "${task.title}"?`,
      message: `Are you sure you want to delete this task? It will be removed from all projects and assignees.`,
      confirmLabel: 'Delete Task Permanently',
      onConfirm: () => onDeleteTask(task.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Task Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit work items, modify schedules, reassign contributors, and eliminate bottlenecks.
          </p>
        </div>

        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search tasks by title, assignee, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-50 text-xs gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Tasks' },
              { id: 'OVERDUE', label: 'Overdue Only', isDanger: true },
              { id: 'TODO', label: 'To Do' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'IN_REVIEW', label: 'Review' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? tab.isDanger
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-primary text-white shadow-xs'
                    : tab.isDanger
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            {filteredTasks.length} tasks matched
          </span>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Task Title & Project</th>
                <th className="py-3.5 px-4">Status (Click to Change)</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Deadline Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED' || task.status === 'Done';
                  const isOverdue = !isDone && task.dueDate && task.dueDate < todayStr;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Title & Project */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                            {task.title}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {task.projectName || 'General Workspace'}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleQuickStatus(task, e.target.value)}
                          className="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-semibold bg-white text-slate-700 cursor-pointer focus:ring-1 focus:ring-primary"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">Review</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>

                      {/* Priority Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={task.priority}
                          onChange={(e) => handleQuickPriority(task, e.target.value)}
                          className="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-semibold bg-white text-slate-700 cursor-pointer focus:ring-1 focus:ring-primary"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4">
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={task.assignees[0].avatar}
                              alt={task.assignees[0].name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-slate-700 truncate max-w-30">
                              {task.assignees[0].name}
                              {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {task.assignedTo || 'Unassigned'}
                          </span>
                        )}
                      </td>

                      {/* Deadline Due */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-600'
                            }`}
                          >
                            {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenTaskDetails?.(task)}
                            title="Inspect Task Overview"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-colors"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => promptDelete(task)}
                            title="Delete Task"
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No tasks found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

