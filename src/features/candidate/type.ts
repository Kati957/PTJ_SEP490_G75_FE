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
  updatedAt?: string;
  status?: string;
  profilePicture?: string | null;
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
  jobSeekerPostId?: number;
  cvId?: number | null;
  selectedCvId?: number | null;
  postTitle?: string;
}

export interface ShortlistedResponse {
  success: boolean;
  total: number;
  data: ShortlistedCandidateDto[];
}

