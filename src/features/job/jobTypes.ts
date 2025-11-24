export interface EmployerPostDto {
  userID: number;
  title: string;
  description: string | null;
  salary: number | null;
  salaryText: string | null;
  requirements: string | null;
  workHourStart: string | null;
  workHourEnd: string | null;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  detailAddress: string | null;
  categoryID: number | null;
  subCategoryId?: number | null;
  phoneContact: string | null;
}

export interface JobPostData {
  jobTitle: string;
  jobDescription: string;
  salaryValue: number | null;
  salaryText: string | null;
  requirements: string;
  workHours: string;
  workHourStart: string | null;
  workHourEnd: string | null;
  detailAddress: string;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  location: string;
  categoryID: number | null;
  subCategoryId: number | null;
  contactPhone: string;
}

export interface JobPostView {
  employerPostId: number;
  title: string;
  description: string | null;
  salary: number | null;
  salaryText?: string | null;
  requirements: string | null;
  workHours: string | null;
  workHourStart?: string | null;
  workHourEnd?: string | null;
  detailAddress?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  location: string | null;
  phoneContact: string | null;
  categoryId?: number | null;
  categoryName: string | null;
  subCategoryId?: number | null;
  subCategoryName?: string | null;
  employerName: string;
  createdAt: string;
  status: 'draft' | 'active' | 'expired' | string;
  companyLogo?: string;
}

export interface JobAiSuggestion {
  title?: string;
  seekerName?: string;
  preferredLocation?: string;
  description?: string;
  matchPercent?: number;
}

export interface JobSuggestionResponse {
  success: boolean;
  data: JobAiSuggestion[];
}

export interface PaginatedJobResponse {
  success: boolean;
  total: number;
  data: JobPostView[];
}

export interface JobPostResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface UpdateJobResponse {
  success: boolean;
  message: string;
  data: JobPostView; 
}

export interface DeleteJobResponse {
  success: boolean;
  message: string;
}

export interface JobApplicationResultDto {
  id: number;
  jobSeekerId: number;
  username: string;
  email: string;
  phone: string;
  cvUrl: string | null;
  coverLetter: string | null;
  status: string;
  applicationDate: string;
  note?: string;
}

export interface JobApplicationUpdateDto {
  status: 'Accepted' | 'Rejected';
  note?: string;
}

export interface ApplicationListResponse {
  success: boolean;
  data: JobApplicationResultDto[];
}

export interface ApplicationActionResponse {
  success: boolean;
  message: string;
}

export interface EmployerApplicationDto {
  submissionId: number;
  jobSeekerId: number;
  username: string;
  email: string;
  phone: string;
  cvUrl: string | null;
  coverLetter: string | null;
  status: string;
  applicationDate: string;
  note?: string;
}

export interface EmployerApplicationListResponse {
  success: boolean;
  data: EmployerApplicationDto[];
}

export interface JobSuggestionDto {
  employerPostId: number;
  title: string;
  location: string;
  matchPercent: number;
  phoneContact: string;
  employerName: string;
  createdAt: string;
  categoryName?: string;
  subCategoryName?: string;
  requirements?: string;
}
