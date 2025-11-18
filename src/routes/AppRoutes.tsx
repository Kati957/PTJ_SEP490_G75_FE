import React from "react";
import { Routes, Route } from "react-router-dom";
import JobSeekerLoginPage from "../features/auth/pages/JobSeekerLoginPage";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import JobSeekerHomePage from "../pages/JobSeekerHomePage";
import EmployerPage from "../features/job/pages/EmployerLandingPage";
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
import EmployerRegisterPage from "../features/employer-auth/pages/EmployerRegisterPage";
import EmployerLayout from "../pages/employer/EmployerLayout";
import EditJobPage from "../features/job/pages/EditJobPage";
import JobSeekerPostPage from "../features/candidate/pages/JobSeekerPostPage";
// import SavedTalentPage from "../features/candidate/pages/SavedTalentPage";
import SavedJobsPage from "../features/savedJob-jobSeeker/pages/SavedJobsPage";
import AppliedJobsPage from "../features/applyJob-jobSeeker/pages/AppliedJobsPage";
import AdminJSPostPage from "../features/admin-js-post/pages/AdminJSPostPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAccountManagementPage from "../pages/admin/AdminAccountManagementPage";
import AdminNewsManagementPage from "../pages/admin/AdminNewsManagementPage";
import AdminJobPostManagementPage from "../pages/admin/AdminJobPostManagementPage";
import AdminCategoryManagementPage from "../pages/admin/AdminCategoryManagementPage";
import AdminReportManagementPage from "../pages/admin/AdminReportManagementPage";
import ListEmployerPage from "../features/listEmployer-jobSeeker/pages/ListEmployerPage";
import JobSeekerProfilePage from "../features/profile-JobSeeker/pages/JobSeekerProfilePage";
import AdminEmployerPostPage from "../features/admin-employer-post/pages/AdminEmployerPostPage";
import CandidateListPage from "../features/applyJob-employer/pages/CandidateListPage";
import ShortlistedCandidatesPage from "../features/candidate/pages/ShortlistedCandidatesPage";
import JobSeekerPostListPage from '../features/jobseekerList-jobSeeker/pages/JobSeekerPostListPage';
import JobSeekerCvPage from "../features/jobSeekerCv/pages/JobSeekerCvPage";

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
        <Route path="register" element={<JobSeekerLoginPage />} />
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
          <Route path="cv-cua-toi" element={<JobSeekerCvPage />} />
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
          <Route path="admin/jobseeker-post" element={<AdminJSPostPage />} />
          <Route
            path="admin/employer-post"
            element={<AdminEmployerPostPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};
