import baseService from "../../services/baseService";
import type { Job } from "../../types/index";
import { getCompanyLogoSrc, getJobDetailCached } from "../../utils/jobPostHelpers";

interface BackendJob {
  employerPostId: number;
  employerId: number;
  title: string;
  description: string | null;
  salary: number | null;
  workHours: string | null;
  location: string | null;
  phoneContact: string | null;
  categoryName: string | null;
  employerName: string | null;
  companyLogo: string | null;
  createdAt: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  total: number;
  data: BackendJob[];
}

const mapBackendJobToFrontendJob = async (backendJob: BackendJob): Promise<Job> => {
  const salaryValue = backendJob.salary ?? null;
  const salaryText =
    salaryValue === null || salaryValue <= 0
      ? "Thỏa thuận"
      : `${salaryValue.toLocaleString("vi-VN")} VND`;

  let companyLogoSrc = backendJob.companyLogo;
  if (!companyLogoSrc || companyLogoSrc.trim().length === 0) {
    const detail = await getJobDetailCached(String(backendJob.employerPostId));
    companyLogoSrc = detail?.companyLogo ?? null;
  }

  return {
    id:
      backendJob.employerPostId?.toString() ??
      `temp-${Math.random().toString(36).slice(2)}`,
    title: backendJob.title ?? "Chua co tieu de",
    description: backendJob.description ?? "Chua co mo ta",
    company: backendJob.employerName ?? null,
    location: backendJob.location ?? null,
    salary: salaryText,
    updatedAt: backendJob.createdAt,
    companyLogo: getCompanyLogoSrc(companyLogoSrc),
    isHot: true,
  };
};

export const getFeaturedJobs = async (): Promise<Job[]> => {
  try {
    const response = await baseService.get<ApiResponse>("/EmployerPost/all");

    if (response && response.success && Array.isArray(response.data)) {
      return await Promise.all(response.data.map((job) => mapBackendJobToFrontendJob(job)));
    }

    return [];
  } catch (error) {
    console.error("Failed to load featured jobs:", error);
    throw error;
  }
};

const homepageJobSeekerService = {
  getFeaturedJobs,
};

export default homepageJobSeekerService;
