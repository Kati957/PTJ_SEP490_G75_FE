export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string | null;
  avatarUrl?: string | null;
}

export interface AdminUserDetail extends AdminUser {
  fullName?: string | null;
  gender?: string | null;
  birthYear?: number | null;
  contactPhone?: string | null;
  fullLocation?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
  companyName?: string | null;
  website?: string | null;
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
