import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserPlus,
  ShieldCheck,
  ToggleLeft,
  FolderKanban,
  FolderPlus,
  UserCheck,
  ListTodo,
  PlusCircle,
  AlertCircle,
  History,
  Bell,
  Building2,
  Lock,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes.js';

const ADMIN_NAV_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'User Management',
    items: [
      { id: 'users', label: 'All Users', icon: Users, badge: '8' },
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    ],
  },
  {
    title: 'Project Management',
    items: [
      { id: 'projects', label: 'All Projects', icon: FolderKanban },
    ],
  },
  {
    title: 'Task Management',
    items: [
      { id: 'tasks', label: 'All Tasks', icon: ListTodo },
      { id: 'overdue-tasks', label: 'Overdue Tasks', icon: AlertCircle, badgeColor: 'bg-rose-50 text-rose-600' },
    ],
  },
  {
    title: 'Activity & Audit',
    items: [
      { id: 'logs', label: 'Activity Logs', icon: History },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Organization Settings', icon: Building2 },
    ],
  },
];

/**
 * Feature Component: AdminSidebar
 * Layer: features/admin/components/
 * Responsibility: Complete administrative multi-tier sidebar navigation with badges and quick routing.
 */
export const AdminSidebar = ({ activeTab, onSelectTab, overdueCount = 0 }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full p-4 select-none">
      <div className="space-y-6">
        {/* Admin Header Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center font-bold">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Admin Console
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Team Sync Enterprise
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="space-y-5 overflow-y-auto max-h-screen pr-1">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                {group.title}
              </h3>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isOverdueItem = item.id === 'overdue-tasks';
                const badgeText = isOverdueItem && overdueCount > 0 ? `${overdueCount}` : item.badge;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#4361EE] text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={15}
                        className={isActive ? 'text-white' : 'text-slate-400'}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badgeText && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Return to App Workspace footer link */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          to={ROUTES.DASHBOARD}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#4361EE] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to App Workspace</span>
        </Link>
      </div>
    </aside>
  );
};

