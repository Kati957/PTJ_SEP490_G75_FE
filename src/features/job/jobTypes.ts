export interface EmployerPostDto {
  userID: number;
  title: string;
  description: string | null;
  salary: number | null;
  requirements: string | null;
  workHours: string | null;
  location: string | null;
  categoryID: number | null;
  phoneContact: string | null;
}

export interface JobPostData {
  jobTitle: string;
  jobDescription: string;
  salaryValue: number | null;
  requirements: string;
  workHours: string;
  location: string;
  categoryID: number | null;
  contactPhone: string;
}

export interface JobPostView {
  employerPostId: number;
  title: string;
  description: string | null;
  salary: number | null;
  requirements: string | null;
  workHours: string | null;
  location: string | null;
  phoneContact: string | null;
  categoryName: string | null;
  employerName: string;
  createdAt: string;
  status: 'draft' | 'active' | 'expired' | string;
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
