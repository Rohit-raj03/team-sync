import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  BookOpen,
  FolderKanban,
  Settings,
  Send,
  FolderPlus,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { useAuth } from "../../../features/auth/hooks/useAuth.js";

/**
 * Shared Layout Component: Sidebar
 * Layer: shared/components/layout/
 * Responsibility: Icon rail navigation matching the exact Figma design screenshot.
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, to: ROUTES.DASHBOARD },
    { label: "Schedule", icon: Calendar, to: ROUTES.TIMELINE },
    { label: "Tasks", icon: BookOpen, to: ROUTES.TASKS },
    { label: "Projects", icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: "Messages", icon: Send, to: ROUTES.MESSAGES },
    { label: "Files", icon: FolderPlus, to: ROUTES.FILES },
    { label: "Settings", icon: Settings, to: ROUTES.SETTINGS },
    { label: "Admin", icon: Shield, to: ROUTES.ADMIN },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-20 bg-white border-r border-slate-100 flex flex-col items-center py-6 transition-transform duration-200 ${
          isOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden mb-2 p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-100  transition-colors focus:outline-none"
          title="Close Navigation"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>

        {/* Navigation Rail */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#4361EE] text-white shadow-md shadow-indigo-300 scale-105"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.2} />
                <span className="hidden lg:group-hover:inline-block absolute left-14 bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div className="w-full px-2 pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => {
              onClose?.();
              logout();
            }}
            title="Log Out"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:cursor-pointer hover:bg-rose-50 transition-all group relative"
          >
            <LogOut size={20} strokeWidth={2} />
            <span className="hidden lg:group-hover:inline-block absolute left-14 bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
              Log Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
