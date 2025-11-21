export interface CreateJobSeekerPostPayload {
  userID: number;
  title: string;
  description: string;
  age: number;
  gender: string;
  preferredWorkHourStart: string;
  preferredWorkHourEnd: string;
  provinceId: number;
  districtId: number;
  wardId: number;
  preferredLocation: string;
  categoryID: number;
  subCategoryId?: number | null;
  phoneContact: string;
  selectedCvId?: number;
}

export interface UpdateJobSeekerPostPayload extends CreateJobSeekerPostPayload {
  jobSeekerPostId: number;
}

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface JobSeekerPost {
  jobSeekerPostId: number;
  userID: number;
  title: string;
  description: string;
  age: number;
  gender: string;
  preferredWorkHours?: string | null;
  preferredWorkHourStart?: string | null;
  preferredWorkHourEnd?: string | null;
  preferredLocation?: string | null;
  locationDetail?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  phoneContact: string;
  categoryID?: number | null;
  categoryName?: string;
  subCategoryId?: number | null;
  subCategoryName?: string;
  seekerName?: string;
  createdAt: string;
  status: string;
  selectedCvId?: number | null;
  cvId?: number | null;
}

export interface GetJobByIdResponse {
  success: boolean;
  data: JobSeekerPost;
}

export interface JobSuggestionData {
  employerPostId: number;
  employerUserId: number;
  title: string;
  description: string;
  location: string;
  workHours: string;
  phoneContact: string;
  categoryName: string;
  subCategoryName?: string;
  employerName: string;
  matchPercent: number;
  rawScore: number;
  isSaved: boolean;
  createdAt: string;
}

export interface JobSuggestionResponse {
  success: boolean;
  total: number;
  data: JobSuggestionData[];
}
