import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobSeekerLoginPage from '../features/auth/pages/JobSeekerLoginPage';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import JobSeekerHomePage from '../pages/JobSeekerHomePage'; 
import EmployerPage from '../features/job/pages/EmployerLandingPage';
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
import PostJobPage from '../features/job/pages/PostJobPage';
import ProtectedRoute from './ProtectedRoute';
import ManagePostingsPage from '../features/jobSeekerPosting/pages/ManagePostingsPage';
import CreatePostingPage from '../features/jobSeekerPosting/pages/CreatePostingPage';
import EmployerRegisterPage from '../features/employer-auth/pages/EmployerRegisterPage';
import EmployerLayout from '../pages/employer/EmployerLayout';
import EditJobPage from '../features/job/pages/EditJobPage';
import JobSeekerPostPage from '../features/candidate/pages/JobSeekerPostPage';
import SavedTalentPage from '../features/candidate/pages/SavedTalentPage';
import SavedJobsPage from '../features/savedJob-jobSeeker/pages/SavedJobsPage';

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
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="verify-success" element={<VerifySuccessPage />} />
        <Route path="verify-failed" element={<VerifyFailedPage />} />

        {/* Job Seeker Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
          <Route path="quan-ly-bai-dang" element={<ManagePostingsPage />} />
          <Route path="tao-bai-dang-tim-viec" element={<CreatePostingPage />} />
          <Route path="viec-lam-da-luu" element={<SavedJobsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="nha-tuyen-dung" element={<EmployerLayout />}>
        <Route index element={<EmployerPage />} />
        <Route path="register" element={<EmployerRegisterPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} />}>
          <Route
            path="nha-tuyen-dung/dashboard"
            element={<EmployerDashboard />}
          />
          <Route
            path="nha-tuyen-dung/cong-viec"
            element={<EmployerJobsPage />}
          />
          <Route path="nha-tuyen-dung/dang-tin" element={<PostJobPage />} />
          <Route path="/nha-tuyen-dung/sua-tin/:id" element={<EditJobPage />} />
          <Route path="/nha-tuyen-dung/tim-kiem" element={<JobSeekerPostPage />} />
          <Route path='/nha-tuyen-dung/tai-nang-da-xem' element={<SavedTalentPage />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}
        ></Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* <Route path="admin/dashboard" element={<AdminDashboard />} /> */}
        </Route>
      </Route>
    </Routes>
  );
};
