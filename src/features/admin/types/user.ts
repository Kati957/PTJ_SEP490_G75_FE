export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

export interface AdminUserDetail extends AdminUser {
  fullName?: string | null;
  gender?: string | null;
  birthYear?: number | null;
  phoneNumber?: string | null;
  address?: string | null;
  preferredLocation?: string | null;
  companyName?: string | null;
  avatarUrl?: string | null;
}

export interface AdminUserFilters {
  role?: string;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export type { PagedResult } from '../services/pagedResultHelper';
