import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { useTasks } from '../../features/tasks/hooks/useTasks.js';
import { useProjects } from '../../features/projects/hooks/useProjects.js';
import { TaskList } from '../../features/tasks/components/TaskList.jsx';
import { CheckCircle2, Clock, FolderKanban, Users } from 'lucide-react';

export const DashboardPage = () => {
  const { allTasks } = useTasks();
  const { projects } = useProjects();

  const stats = [
    { label: 'Total Tasks', value: allTasks.length, icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'In Progress', value: allTasks.filter((t) => t.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Projects', value: projects.length, icon: FolderKanban, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Team Members', value: 8, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Overview"
        subtitle="Monitor project health, sprints, and task progress in real time."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${s.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Tasks</h3>
        <TaskList tasks={allTasks.slice(0, 3)} />
      </div>
    </div>
  );
};
