import baseService from "../../services/baseService";
import type { JobSeekerPostDtoOut, SaveCandidateDto, ShortlistedResponse } from "./type";

interface JobSeekerPostDetailResponse {
  success: boolean;
  data: any;
}

export interface PaginatedJobResponse {
  success: boolean;
  total: number;
  data: any[];
}

const normalizePost = (p: any): JobSeekerPostDtoOut => ({
  jobSeekerPostId: p.jobSeekerPostId ?? p.JobSeekerPostId ?? 0,
  userID: p.userID ?? p.UserID ?? 0,
  title: p.title ?? p.Title ?? "",
  description: p.description ?? p.Description,
  age: p.age ?? p.Age,
  gender: p.gender ?? p.Gender,
  preferredWorkHours: p.preferredWorkHours ?? p.PreferredWorkHours,
  preferredWorkHourStart: p.preferredWorkHourStart ?? p.PreferredWorkHourStart,
  preferredWorkHourEnd: p.preferredWorkHourEnd ?? p.PreferredWorkHourEnd,
  preferredLocation: p.preferredLocation ?? p.PreferredLocation,
  phoneContact: p.phoneContact ?? p.PhoneContact,
  categoryName: p.categoryName ?? p.CategoryName,
  seekerName: p.seekerName ?? p.SeekerName,
  createdAt: p.createdAt ?? p.CreatedAt ?? "",
  updatedAt: p.updatedAt ?? p.UpdatedAt,
  status: p.status ?? p.Status,
  profilePicture: p.profilePicture ?? p.ProfilePicture ?? null,
  cvId: p.cvId ?? p.CvId ?? p.selectedCvId ?? p.SelectedCvId ?? null,
  selectedCvId: p.selectedCvId ?? p.SelectedCvId ?? p.cvId ?? p.CvId ?? null,
});

export const jobSeekerPostService = {
  getAllJobSeekerPosts: async (): Promise<PaginatedJobResponse> => {
    const res = await baseService.get<PaginatedJobResponse>('/JobSeekerPost/all');
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data.map(normalizePost) : [],
    };
  },
  getJobSeekerPostById: async (postId: number): Promise<JobSeekerPostDetailResponse> => {
    const res = await baseService.get<JobSeekerPostDetailResponse>(`/JobSeekerPost/${postId}`);
    return {
      ...res,
      data: normalizePost(res.data),
    };
  },
  saveCandidate: async (dto: SaveCandidateDto) => {
    const res = await baseService.post<{ success: boolean; message: string }>(
      "/EmployerPost/save-candidate",
      dto
    );
    return res;
  },

  unsaveCandidate: async (dto: SaveCandidateDto) => {
    const res = await baseService.post<{ success: boolean; message: string }>(
      "/EmployerPost/unsave-candidate",
      dto
    );
    return res;
  },
  getShortlistedCandidates: async (postId: number): Promise<ShortlistedResponse> => {
    return await baseService.get<ShortlistedResponse>(`/EmployerPost/shortlist/${postId}`);
  },
};
