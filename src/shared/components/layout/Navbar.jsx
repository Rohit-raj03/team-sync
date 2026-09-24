import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar.jsx';
import { useAuth } from '../../../features/auth/hooks/useAuth.js';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <Avatar name={user?.name || 'Jane Doe'} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'Jane Doe'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Product Lead'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
