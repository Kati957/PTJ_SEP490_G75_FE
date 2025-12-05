import baseService from "../../services/baseService";
import type { EmployerPublicProfile } from "./types";
import type { Job } from "../../types";
import { formatSalaryText } from "../../utils/jobPostHelpers";

// URL API
const PROFILE_API_URL = "/EmployerProfile";
const JOB_API_URL = "/EmployerPost/by-user";

type RawEmployerProfile = Partial<EmployerPublicProfile> & {
  userId?: number | string;
  role?: string;
};

interface RawEmployerPost {
  employerPostId: number | string;
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  salaryDisplay?: string;
  createdAt?: string;
  isHot?: boolean;
}

interface EmployerJobsResponse {
  data: RawEmployerPost[];
}

export const getEmployerFullDetail = async (userId: number | string) => {
  try {
    const [profileRes, jobsRes] = await Promise.all([
      baseService.get<RawEmployerProfile>(`${PROFILE_API_URL}/${userId}`),
      baseService.get<EmployerJobsResponse>(`${JOB_API_URL}/${userId}`),
    ]);

    const rawProfile = profileRes;

    const profile: EmployerPublicProfile = {
      userId: String(rawProfile.userId ?? userId ?? ""),
      displayName: rawProfile.displayName || "Nhà tuyển dụng ẩn danh",
      description: rawProfile.description || "",
      avatarUrl: rawProfile.avatarUrl || "",
      website: rawProfile.website || "",
      contactPhone: rawProfile.contactPhone || "",
      contactEmail: rawProfile.contactEmail || "",
      location: rawProfile.location || "",
      role: rawProfile.role,
    };

    const rawJobs = jobsRes.data || [];

    const mappedJobs: Job[] = rawJobs.map((job) => ({
      id: job.employerPostId.toString(),
      title: job.title,
      description: job.description,
      company: profile.displayName,
      location: job.location ?? null,
      salary: formatSalaryText(
        job.salaryMin ?? null,
        job.salaryMax ?? null,
        job.salaryType !== undefined ? Number(job.salaryType) : null,
        job.salaryDisplay ?? null
      ),
      updatedAt: job.createdAt ?? "",
      companyLogo: profile.avatarUrl,
      isHot: job.isHot || false,
    }));

    return {
      profile,
      jobs: mappedJobs,
    };
  } catch (error) {
    // Giữ log cho việc theo dõi lỗi API
    console.error("Lỗi khi lấy chi tiết nhà tuyển dụng:", error);
    throw error;
  }
};
