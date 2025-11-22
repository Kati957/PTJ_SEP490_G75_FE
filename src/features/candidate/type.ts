export interface JobSeekerPostDtoOut {
  jobSeekerPostId: number;
  userID: number;
  title: string;
  description?: string;
  age?: number;
  gender?: string;
  preferredWorkHours?: string;
  preferredWorkHourStart?: string;
  preferredWorkHourEnd?: string;
  preferredLocation?: string;
  phoneContact?: string;
  categoryName?: string;
  seekerName?: string;
  createdAt: string;
  status?: string;
  selectedCvId?: number | null;
  cvId?: number | null;
}

export interface SaveCandidateDto {
  employerId: number;
  employerPostId: number;
  jobSeekerId: number;
  note?: string;
}

export interface ShortlistedCandidateDto {
  jobSeekerId: number;
  jobSeekerName: string;
  note: string | null;
  addedAt: string;
  jobSeekerPostId?: number | null;
  cvId?: number | null;
  selectedCvId?: number | null;
}

export interface ShortlistedResponse {
  success: boolean;
  total: number;
  data: ShortlistedCandidateDto[];
}

