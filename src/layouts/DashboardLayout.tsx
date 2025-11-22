import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { EmployerHeader } from "./components/EmployerHeader";
import EmployerSidebar from "./components/EmployerSidebar";
import AdminSidebar from "./components/AdminSidebar";

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const isAdminRoute = useMemo(() => location.pathname.startsWith("/admin"), [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <EmployerHeader onToggleSidebar={!isAdminRoute ? toggleSidebar : undefined} />

      <div className="flex flex-1">
        {isAdminRoute ? <AdminSidebar /> : <EmployerSidebar isOpen={isSidebarOpen} />}

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
