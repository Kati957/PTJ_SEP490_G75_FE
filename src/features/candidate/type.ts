export interface JobSeekerPostDtoOut {
  jobSeekerPostId: number;
  userID: number;
  title: string;
  description?: string;
  age?: number;
  gender?: string;
  preferredWorkHours?: string;
  preferredLocation?: string;
  phoneContact?: string;
  categoryName?: string;
  seekerName?: string;
  createdAt: string;
  status?: string;
}

export interface SaveCandidateDto {
  employerId: number;
  employerPostId: number;
  jobSeekerId: number;
  note?: string;
}

