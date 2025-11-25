
export interface Employer {
  id: number;
  name: string;
  logo: string;
  jobCount: number;
  locations: string[];
  rating?: number;
}

export interface EmployerJob {
    location: string;
}

export interface EmployerJobResponse {
    success: boolean;
    total: number;
    data: EmployerJob[];
}

export interface UserApiResponse {
    userId: number;       
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    lastLogin: string;
    avatarUrl: string;  
}

export interface PaginatedApiResponse<T> {
    data: T[];
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface EmployerFilter {
  keyword?: string;
  page?: number;
  pageSize?: number;
}
