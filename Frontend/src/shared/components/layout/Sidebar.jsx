import React, { useState } from "react";
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

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTooltip, setActiveTooltip] = useState(null);

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, to: ROUTES.DASHBOARD },
    { label: "Schedule", icon: Calendar, to: ROUTES.TIMELINE },
    { label: "Tasks", icon: BookOpen, to: ROUTES.TASKS },
    { label: "Projects", icon: FolderKanban, to: ROUTES.PROJECTS },
    { label: "Messages", icon: Send, to: ROUTES.MESSAGES },
    { label: "Files", icon: FolderPlus, to: ROUTES.FILES },
    { label: "Settings", icon: Settings, to: ROUTES.SETTINGS },
    ...(user?.role === "admin"
      ? [{ label: "Admin", icon: Shield, to: ROUTES.ADMIN }]
      : []),
  ];

  const handleNavClick = () => {
    setActiveTooltip(null);
    onClose?.();
  };

  const handleLogout = () => {
    setActiveTooltip(null);
    onClose?.();
    logout();
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => {
            setActiveTooltip(null);
            onClose?.();
          }}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        onMouseLeave={() => setActiveTooltip(null)}
        className={`fixed lg:static top-0 bottom-0 left-0 z-50
          w-20 shrink-0 bg-white border-r border-slate-100
          flex flex-col items-center py-6
          transition-transform duration-200
          ${
            isOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTooltip(null);
            onClose?.();
          }}
          className="lg:hidden mb-2 p-2 rounded-xl text-slate-400
            hover:text-red-400 hover:bg-slate-100 transition-colors"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>

        <nav
          className="flex-1 flex flex-col items-center justify-center
          gap-6 w-full px-2 mt-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                onMouseEnter={() => setActiveTooltip(item.to)}
                onFocus={() => setActiveTooltip(item.to)}
                onBlur={() => setActiveTooltip(null)}
                aria-label={item.label}
                className={({ isActive }) =>
                  `w-11 h-11 shrink-0 rounded-2xl
                  flex items-center justify-center
                  transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-[#4361EE] text-white shadow-md shadow-indigo-300"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.2} />

                <span
                  className={`absolute left-14 top-1/2 -translate-y-1/2
                    bg-slate-800 text-white text-[11px] font-semibold
                    px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg
                    z-[60] pointer-events-none
                    ${activeTooltip === item.to ? "inline-block" : "hidden"}`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div
          className="w-full px-2 pt-4 border-t border-slate-100
          flex justify-center"
        >
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={() => setActiveTooltip("logout")}
            onFocus={() => setActiveTooltip("logout")}
            onBlur={() => setActiveTooltip(null)}
            aria-label="Log out"
            className="w-11 h-11 shrink-0 rounded-2xl
              flex items-center justify-center text-slate-400
              hover:text-rose-600 hover:bg-rose-50 transition-all
              group relative"
          >
            <LogOut size={20} strokeWidth={2} />

            <span
              className={`absolute left-14 top-1/2 -translate-y-1/2
                bg-slate-800 text-white text-[11px] font-semibold
                px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg
                z-[60] pointer-events-none
                ${activeTooltip === "logout" ? "inline-block" : "hidden"}`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
