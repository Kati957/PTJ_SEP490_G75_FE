import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { EmployerHeader } from "./components/EmployerHeader";
import { EmployerSidebar } from "./components/EmployerSidebar";

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen">
      <EmployerHeader onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <EmployerSidebar isOpen={isSidebarOpen} />

        <main
          className="flex-grow p-6 overflow-y-auto bg-gray-50 transition-all duration-300"
          style={{ height: "calc(100vh - 68px)" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
