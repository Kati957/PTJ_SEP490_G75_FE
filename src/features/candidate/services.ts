import baseService from "../../services/baseService";
import type { JobSeekerPostDtoOut, SaveCandidateDto } from "./type";

export interface PaginatedJobResponse {
  success: boolean;
  total: number;
  data: JobSeekerPostDtoOut[];
}

export const jobSeekerPostService = {
  getAllJobSeekerPosts: async (): Promise<PaginatedJobResponse> => {
    return await baseService.get<PaginatedJobResponse>('/JobSeekerPost/all');
  },
  saveCandidate: async (dto: SaveCandidateDto) => {
    const res = await baseService.post<{ success: boolean; message: string }>(
      "/JobSeekerPost/save-candidate",
      dto
    );
    return res;
  },

  unsaveCandidate: async (dto: SaveCandidateDto) => {
    const res = await baseService.post<{ success: boolean; message: string }>(
      "/JobSeekerPost/unsave-candidate",
      dto
    );
    return res;
  },
};
