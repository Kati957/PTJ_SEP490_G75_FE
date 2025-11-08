export interface JobCategory {
  id: string;
  name: string;
  count: number;
}

export interface JobMajor {
  id: string;
  name: string;
  categories: JobCategory[];
}

export interface JobLocation {
  id: string;
  name: string;
  count: number;
}

export interface EmployerPostDtoOutResponse {
  success: boolean;
  data: EmployerPostDtoOut;
}

export interface EmployerPostDtoOut {
  employerPostId: number;
  employerId: number;
  title: string;
  description?: string;
  salary?: number;
  requirements?: string;
  workHours?: string;
  location?: string;
  phoneContact?: string;
  categoryName?: string;
  employerName?: string;
  createdAt: string; 
  status: string;
}
