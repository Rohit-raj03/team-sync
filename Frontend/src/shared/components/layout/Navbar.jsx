import React, { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

/**
 * Shared Layout Component: Navbar
 * Layer: shared/components/layout/
 * Responsibility: Top navigation header with centered search bar, hamburger toggle for mobile/tablet when sidebar is hidden, notification badge, and profile dropdown.
 */
export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header className="h-20 bg-white px-4 md:px-5 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100/80">
      {/* Left: Hamburger (shown when sidebar is hidden on < 1024px) + Brand Logo & Title */}
      <div className="flex items-center gap-2 sm:gap-3 w-auto sm:w-48">
        {/* Hamburger Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>

        <img
          src="/logo.png"
          alt="Team Sync"
          className="w-10 h-10 object-contain drop-shadow-sm cursor-pointer"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        />
        <div className="hidden sm:block">
          <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">
            Team Sync
          </span>
        </div>
      </div>

      {/* Center: Search input with magnifying glass on the RIGHT */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-5 pr-11 py-2.5 bg-[#F4F7FB] text-xs font-medium text-slate-800 rounded-full border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-5">
        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer">
          <button
            className="p-2 text-slate-500 hover:text-indigo-600 transition-colors relative focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#4361EE] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </button>
        </div>

        {/* User Profile Avatar with dropdown arrow */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
              alt="Angelina"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
            />
            <ChevronDown size={15} className="text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Angelina</p>
                <p className="text-[10px] text-slate-400">
                  angelina@teamsync.io
                </p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate(ROUTES.PROFILE);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate(ROUTES.SETTINGS);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate(ROUTES.ADMIN);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center justify-between"
              >
                <span>Admin Console</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">Root</span>
              </button>
              <div className="border-t border-slate-100 pt-1 hover:pointer">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
