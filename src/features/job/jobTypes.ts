import type { SalaryTypeCode } from "../../utils/salary";

export interface EmployerPostDto {
  userID: number;
  title: string;
  description: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: SalaryTypeCode | null;
  requirements: string | null;
  workHourStart: string | null;
  workHourEnd: string | null;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  detailAddress: string | null;
  categoryID: number | null;
  phoneContact: string | null;
  expiredAt?: string | null;
  images?: File[];
  deleteImageIds?: number[];
}

export interface JobPostData {
  jobTitle: string;
  jobDescription: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: SalaryTypeCode | null;
  salaryDisplay?: string | null;
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
  contactPhone: string;
  images: File[];
  imagePreviews: string[];
  existingImages: EmployerPostImage[];
  deleteImageIds: number[];
  expiredAt: string | null;
}

export interface JobPostView {
  employerPostId: number;
  title: string;
  description: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: SalaryTypeCode | null;
  salaryDisplay?: string | null;
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
  expiredAtText?: string | null;
  employerName: string;
  createdAt: string;
  status: "draft" | "active" | "expired" | string;
  companyLogo?: string;
  imageUrls?: string[];
  images?: EmployerPostImage[];
}

export interface EmployerPostImage {
  imageId: number;
  url: string;
}

export interface JobSuggestionDto {
  employerPostId: number;
  title: string;
  matchPercent: number;
  phoneContact: string;
  employerName: string;
  createdAt: string;
  location?: string | null;
  preferredLocation?: string | null;
  categoryName?: string;
  requirements?: string;
  seekerName?: string;
  description?: string;
  seekerUserId?: number;
  jobSeekerPostId?: number;
  age?: number;
  gender?: string;
  preferredWorkHours?: string;
  isSaved?: boolean;
  rawScore?: number;
  selectedCvId?: number | null;
  cvId?: number | null;
}

export interface JobSuggestionResponse {
  success: boolean;
  data: JobSuggestionDto[];
}

export interface PaginatedJobResponse {
  success: boolean;
  total: number;
  data: JobPostView[];
}

export interface JobPostResponse {
  success: boolean;
  message: string;
  data: JobPostView | null;
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

export interface JobStatusToggleResponse {
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
  status: 'Accepted' | 'Rejected' | 'Interviewing';
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

