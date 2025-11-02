import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobSeekerLoginPage from '../features/auth/pages/JobSeekerLoginPage';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import JobSeekerHomePage from '../pages/JobSeekerHomePage'; 
import EmployerPage from '../pages/employer/EmployerLandingPage';
import JobDetailPage from '../features/findJob-jobSeeker/pages/JobDetailPage';
import JobListPage from '../features/findJob-jobSeeker/pages/JobListPage';
import FindJobPage from '../features/findJob-jobSeeker/pages/FindJobPage';
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import VerifySuccessPage from '../features/auth/pages/VerifySuccessPage';
import VerifyFailedPage from '../features/auth/pages/VerifyFailedPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import { ROLES } from '../constants/roles';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import EmployerJobsPage from '../pages/employer/EmployerJobsPage';
import PostJobPage from '../pages/employer/PostJobPage';
import ProtectedRoute from './ProtectedRoute';
import ManagePostingsPage from '../features/jobSeekerPosting/pages/ManagePostingsPage';
import CreatePostingPage from '../features/jobSeekerPosting/pages/CreatePostingPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<JobSeekerHomePage />} />
        <Route path="viec-lam" element={<FindJobPage />} />
        <Route path="viec-lam/chi-tiet/:id" element={<JobDetailPage />} />
        <Route path="viec-lam/:slug" element={<JobListPage />} />
        <Route path="login" element={<JobSeekerLoginPage />} />
        <Route path="register" element={<JobSeekerLoginPage />} />
        <Route path="nha-tuyen-dung" element={<EmployerPage />} /> 
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="verify-success" element={<VerifySuccessPage />} />
        <Route path="verify-failed" element={<VerifyFailedPage />} />

        {/* Job Seeker Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
          <Route path="quan-ly-bai-dang" element={<ManagePostingsPage />} />
          <Route path="tao-bai-dang-tim-viec" element={<CreatePostingPage />} />
        </Route>

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