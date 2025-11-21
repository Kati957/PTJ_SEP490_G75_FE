import React from "react";
import { Routes, Route } from "react-router-dom";
import JobSeekerLoginPage from "../features/auth/pages/JobSeekerLoginPage";
import UnifiedRegisterPage from "../features/auth/pages/UnifiedRegisterPage";
import EmailVerifyPage from "../features/auth/pages/EmailVerifyPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import ChangePasswordPage from "../features/auth/pages/ChangePasswordPage";
import ConfirmChangePasswordPage from "../features/auth/pages/ConfirmChangePasswordPage";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import JobSeekerHomePage from "../pages/JobSeekerHomePage";
import JobDetailPage from "../features/findJob-jobSeeker/pages/JobDetailPage";
import JobListPage from "../features/findJob-jobSeeker/pages/JobListPage";
import FindJobPage from "../features/findJob-jobSeeker/pages/FindJobPage";
import UnauthorizedPage from "../pages/common/UnauthorizedPage";
import VerifySuccessPage from "../features/auth/pages/VerifySuccessPage";
import VerifyFailedPage from "../features/auth/pages/VerifyFailedPage";
import GoogleRoleSelectionPage from "../features/auth/pages/GoogleRoleSelectionPage";
import NotFoundPage from "../pages/common/NotFoundPage";
import { ROLES } from "../constants/roles";
import EmployerDashboard from "../pages/employer/EmployerDashboard";
import EmployerJobsPage from "../pages/employer/EmployerJobsPage";
import EmployerProfilePage from "../pages/employer/EmployerProfilePage";
import PostJobPage from "../features/job/pages/PostJobPage";
import ProtectedRoute from "./ProtectedRoute";
import ManagePostingsPage from "../features/jobSeekerPosting/pages/ManagePostingsPage";
import CreatePostingPage from "../features/jobSeekerPosting/pages/CreatePostingPage";
import EditJobPage from "../features/job/pages/EditJobPage";
import JobSeekerPostPage from "../features/candidate/pages/JobSeekerPostPage";
// import SavedTalentPage from "../features/candidate/pages/SavedTalentPage";
import SavedJobsPage from "../features/savedJob-jobSeeker/pages/SavedJobsPage";
import AppliedJobsPage from "../features/applyJob-jobSeeker/pages/AppliedJobsPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAccountManagementPage from "../pages/admin/AdminAccountManagementPage";
import AdminNewsManagementPage from "../pages/admin/AdminNewsManagementPage";
import AdminJobPostManagementPage from "../pages/admin/AdminJobPostManagementPage";
import AdminCategoryManagementPage from "../pages/admin/AdminCategoryManagementPage";
import AdminReportManagementPage from "../pages/admin/AdminReportManagementPage";
import ListEmployerPage from "../features/listEmployer-jobSeeker/pages/ListEmployerPage";
import JobSeekerProfilePage from "../features/profile-JobSeeker/pages/JobSeekerProfilePage";
import AdminEmployerPostPage from "../features/admin-employer-post/pages/AdminEmployerPostPage";
import AdminEmployerRegistrationPage from "../pages/admin/AdminEmployerRegistrationPage";
import CandidateListPage from "../features/applyJob-employer/pages/CandidateListPage";
import ShortlistedCandidatesPage from "../features/candidate/pages/ShortlistedCandidatesPage";
import JobSeekerPostListPage from '../features/jobseekerList-jobSeeker/pages/JobSeekerPostListPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<JobSeekerHomePage />} />
        <Route path="viec-lam" element={<FindJobPage />} />
        <Route path="viec-lam/chi-tiet/:id" element={<JobDetailPage />} />
        <Route path="viec-lam/:slug" element={<JobListPage />} />
        <Route path="employer" element={<ListEmployerPage />} />
        <Route path="login" element={<JobSeekerLoginPage />} />
        <Route path="register" element={<UnifiedRegisterPage />} />
        <Route path="nha-tuyen-dung/register" element={<UnifiedRegisterPage defaultRole="employer" />} />
        <Route path="verify-email" element={<EmailVerifyPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="account/confirm-change-password" element={<ConfirmChangePasswordPage />} />
        <Route path="set-new-password" element={<ConfirmChangePasswordPage />} />
        <Route path="google/select-role" element={<GoogleRoleSelectionPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="verify-success" element={<VerifySuccessPage />} />
        <Route path="verify-failed" element={<VerifyFailedPage />} />
        <Route path="danh-sach-bai-dang-tim-viec" element={<JobSeekerPostListPage />} />


        {/* Job Seeker Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
          <Route path="quan-ly-bai-dang" element={<ManagePostingsPage />} />
          <Route path="tao-bai-dang-tim-viec" element={<CreatePostingPage />} />
          <Route
            path="xem-bai-dang-tim-viec/:id"
            element={<CreatePostingPage />}
          />
          <Route
            path="sua-bai-dang-tim-viec/:id"
            element={<CreatePostingPage />}
          />
          <Route path="viec-lam-da-luu" element={<SavedJobsPage />} />
          <Route path="viec-da-ung-tuyen" element={<AppliedJobsPage />} />
          <Route path="tai-khoan" element={<JobSeekerProfilePage />} />
          <Route path="doi-mat-khau" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
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
          <Route
            path="/nha-tuyen-dung/tim-kiem"
            element={<JobSeekerPostPage />}
          />
          {/* <Route
            path="/nha-tuyen-dung/tai-nang-da-xem"
            element={<SavedTalentPage />}
          /> */}
          <Route
            path="nha-tuyen-dung/ho-so"
            element={<EmployerProfilePage />}
          />
          <Route
            path="nha-tuyen-dung/doi-mat-khau"
            element={<ChangePasswordPage />}
          />
          <Route
            path="/nha-tuyen-dung/ung-vien/:employerPostId"
            element={<CandidateListPage />}
          />
          <Route
            path="/nha-tuyen-dung/da-luu/:employerPostId"
            element={<ShortlistedCandidatesPage />}
          />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={[ROLES.JOB_SEEKER]} />}
        ></Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="admin/accounts"
            element={<AdminAccountManagementPage />}
          />
          <Route path="admin/news" element={<AdminNewsManagementPage />} />
          <Route
            path="admin/job-posts"
            element={<AdminJobPostManagementPage />}
          />
          <Route
            path="admin/categories"
            element={<AdminCategoryManagementPage />}
          />
          <Route path="admin/reports" element={<AdminReportManagementPage />} />
          <Route
            path="admin/employer-post"
            element={<AdminEmployerPostPage />}
          />
          <Route
            path="admin/employer-registrations"
            element={<AdminEmployerRegistrationPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};
