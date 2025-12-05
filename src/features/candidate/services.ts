import baseService from "../../services/baseService";
import type { JobSeekerPostDtoOut, SaveCandidateDto, ShortlistedResponse } from "./type";

interface JobSeekerPostDetailResponse {
  success: boolean;
  data: JobSeekerPostDtoOut;
}

export interface PaginatedJobResponse {
  success: boolean;
  total: number;
  data: JobSeekerPostDtoOut[];
}

type RawJobSeekerPost = Partial<JobSeekerPostDtoOut> & Record<string, unknown>;

const toNumber = (value: unknown, fallback: number | null = null): number | null => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toStringSafe = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toOptionalString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const toStringOrNull = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return String(value);
};

const normalizePost = (p: RawJobSeekerPost): JobSeekerPostDtoOut => ({
  jobSeekerPostId: toNumber(p.jobSeekerPostId ?? p.JobSeekerPostId, 0) ?? 0,
  userID: toNumber(p.userID ?? p.UserID, 0) ?? 0,
  title: toStringSafe(p.title ?? p.Title, ""),
  description: toOptionalString(p.description ?? p.Description),
  age: toOptionalNumber(p.age ?? p.Age),
  gender: toOptionalString(p.gender ?? p.Gender),
  preferredWorkHours: toOptionalString(p.preferredWorkHours ?? p.PreferredWorkHours),
  preferredWorkHourStart: toOptionalString(p.preferredWorkHourStart ?? p.PreferredWorkHourStart),
  preferredWorkHourEnd: toOptionalString(p.preferredWorkHourEnd ?? p.PreferredWorkHourEnd),
  preferredLocation: toOptionalString(p.preferredLocation ?? p.PreferredLocation),
  phoneContact: toOptionalString(p.phoneContact ?? p.PhoneContact),
  categoryName: toOptionalString(p.categoryName ?? p.CategoryName),
  seekerName: toOptionalString(p.seekerName ?? p.SeekerName),
  createdAt: toStringSafe(p.createdAt ?? p.CreatedAt, ""),
  updatedAt: toOptionalString(p.updatedAt ?? p.UpdatedAt),
  status: toOptionalString(p.status ?? p.Status),
  profilePicture: toStringOrNull(p.profilePicture ?? p.ProfilePicture) ?? null,
  cvId: toOptionalNumber(p.cvId ?? p.CvId ?? p.selectedCvId ?? p.SelectedCvId) ?? null,
  selectedCvId: toOptionalNumber(p.selectedCvId ?? p.SelectedCvId ?? p.cvId ?? p.CvId) ?? null,
});

interface RawJobSeekerPostDetailResponse {
  success: boolean;
  data: RawJobSeekerPost;
}

interface RawPaginatedJobResponse {
  success: boolean;
  total: number;
  data: RawJobSeekerPost[] | null;
}

export const jobSeekerPostService = {
  getAllJobSeekerPosts: async (): Promise<PaginatedJobResponse> => {
    const res = await baseService.get<RawPaginatedJobResponse>('/JobSeekerPost/all');
    const rawData = Array.isArray(res.data) ? res.data : [];
    return {
      ...res,
      data: rawData.map(normalizePost),
    };
  },
  getJobSeekerPostById: async (postId: number): Promise<JobSeekerPostDetailResponse> => {
    const res = await baseService.get<RawJobSeekerPostDetailResponse>(`/JobSeekerPost/${postId}`);
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
