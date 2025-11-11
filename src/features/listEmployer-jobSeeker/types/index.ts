
export interface Employer {
  id: number;
  name: string;
  logo: string;
}

export interface UserApiResponse {
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    lastLogin: string;
}

export interface EmployerFilter {
  keyword?: string;
}
