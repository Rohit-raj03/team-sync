import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Navbar } from "./Navbar.jsx";

/**
 * Shared Layout Component: MainLayout
 * Layer: shared/components/layout/
 * Responsibility: Shell container assembling the Sidebar, Navbar, and responsive main canvas.
 */
export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F7FE] overflow-hidden font-sans">
      {/* Sidebar Rail */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
