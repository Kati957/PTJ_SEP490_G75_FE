import React, { useState } from 'react'; // Import useState
import { Header } from './components/Header'; 
import { Sidebar } from './components/Sidebar';
import { Outlet } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-grow p-6 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;