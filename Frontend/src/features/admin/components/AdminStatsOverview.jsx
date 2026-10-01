import React from 'react';
import {
  Users,
  UserCheck,
  FolderKanban,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

/**
 * Feature Component: AdminStatsOverview
 * Layer: features/admin/components/
 * Responsibility: Displays top-tier administrative statistics cards with metrics for users, projects, tasks, and overdue items.
 */
export const AdminStatsOverview = ({ metrics }) => {
  const cards = [
    {
      label: 'Total Users',
      value: metrics.totalUsers,
      subtext: `${metrics.activeUsers} active now`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      trend: '+12% this month',
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers,
      subtext: `${Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100)}% retention rate`,
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'High Engagement',
    },
    {
      label: 'Total Projects',
      value: metrics.totalProjects,
      subtext: `${metrics.activeProjects} actively managed`,
      icon: FolderKanban,
      color: 'bg-indigo-50 text-indigo-600',
      trend: '4 workspaces',
    },
    {
      label: 'Active Projects',
      value: metrics.activeProjects,
      subtext: 'Ongoing deliverables',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      trend: '100% on schedule',
    },
    {
      label: 'Total Tasks',
      value: metrics.totalTasks,
      subtext: `${metrics.completedTasks} completed`,
      icon: ListTodo,
      color: 'bg-cyan-50 text-cyan-600',
      trend: '+8 new this week',
    },
    {
      label: 'Completed Tasks',
      value: metrics.completedTasks,
      subtext: `${Math.round((metrics.completedTasks / (metrics.totalTasks || 1)) * 100)}% completion rate`,
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-600',
      trend: 'Optimal Velocity',
    },
    {
      label: 'Overdue Tasks',
      value: metrics.overdueTasks,
      subtext: metrics.overdueTasks === 0 ? 'All tasks on time' : 'Requires attention',
      icon: AlertTriangle,
      color: metrics.overdueTasks > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500',
      trend: metrics.overdueTasks > 0 ? 'Needs review' : 'Zero blockers',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-4 bg-white rounded-2xl border border-slate-100/90 shadow-xs hover:border-indigo-100 transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={14} />
              </div>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-[#4361EE] bg-indigo-50/70 px-2 py-0.5 rounded-md truncate block text-center">
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

