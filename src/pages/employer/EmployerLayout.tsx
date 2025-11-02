import React from 'react';
import { EmployerHeader } from '../../layouts/components/EmployerHeader';
import { Footer } from 'antd/es/layout/layout';
import { Outlet } from 'react-router-dom';

export const EmployerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <EmployerHeader/> 
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default EmployerLayout;
