import baseService from "../../services/baseService";
import type { EmployerPublicProfile } from "./types";
import type { Job } from "../../types";

// URL API
const PROFILE_API_URL = 'https://localhost:7100/api/EmployerProfile/public';
const JOB_API_URL = 'https://localhost:7100/api/EmployerPost/by-user';

export const getEmployerFullDetail = async (userId: number | string) => {
    try {
        const [profileRes, jobsRes] = await Promise.all([
            baseService.get<any>(`${PROFILE_API_URL}/${userId}`),
            baseService.get<any>(`${JOB_API_URL}/${userId}`)
        ]);

        const rawProfile = profileRes; 

        const profile: EmployerPublicProfile = {
            userId: rawProfile.userId,
            displayName: rawProfile.displayName || "Nhà tuyển dụng ẩn danh",
            description: rawProfile.description || "",
            avatarUrl: rawProfile.avatarUrl || "",
            website: rawProfile.website || "",
            contactPhone: rawProfile.contactPhone || "",
            contactEmail: rawProfile.contactEmail || "",
            location: rawProfile.location || "",
            role: rawProfile.role
        };

        const rawJobs = jobsRes.data || [];
        
        const mappedJobs: Job[] = rawJobs.map((job: any) => ({
            id: job.employerPostId.toString(),
            title: job.title,
            description: job.description,
            company: profile.displayName,
            location: job.location,
            salary: job.salary || "Thỏa thuận",
            updatedAt: job.createdAt,
            companyLogo: profile.avatarUrl, 
            isHot: job.isHot || false
        }));

        return {
            profile,
            jobs: mappedJobs
        };

    } catch (error) {
        console.error("Lỗi khi lấy thông tin chi tiết nhà tuyển dụng:", error);
        throw error;
    }
};
