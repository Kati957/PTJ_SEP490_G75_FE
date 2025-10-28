import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import JobSeekerHomePage from '../pages/JobSeekerHomePage'; 
import EmployerPage from '../pages/employer/EmployerLandingPage';
import JobPage from '../features/job/pages/JobPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../constants/roles';
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import EmployerJobsPage from '../pages/employer/EmployerJobsPage';
import PostJobPage from '../pages/employer/PostJobPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<JobSeekerHomePage />} />
        <Route path="jobs" element={<JobPage />} />
        
        <Route path="nha-tuyen-dung" element={<EmployerPage />} /> 
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<DashboardLayout />}>

        {/* Protected Routes for Employers */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} />}>
          <Route path="nha-tuyen-dung/dashboard" element={<EmployerDashboard />} />
          <Route path="nha-tuyen-dung/cong-viec" element={<EmployerJobsPage />} />
          <Route path="nha-tuyen-dung/dang-tin" element={<PostJobPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
        </Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* <Route path="admin/dashboard" element={<AdminDashboard />} /> */}
        </Route>

      </Route>
      
    </Routes>
  );
};