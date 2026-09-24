import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../../features/auth/hooks/useAuth.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
    { label: 'Tasks', icon: CheckSquare, to: ROUTES.TASKS },
    { label: 'Projects', icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: 'Team', icon: Users, to: ROUTES.TEAM },
    { label: 'Profile', icon: User, to: ROUTES.PROFILE },
    { label: 'Settings', icon: Settings, to: ROUTES.SETTINGS },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white text-base">
            TS
          </div>
          <span className="font-bold text-lg text-white tracking-tight">TeamSync</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
