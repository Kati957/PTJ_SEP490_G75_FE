import type { PagedResult } from '../services/pagedResultHelper';

export interface AdminEmployerPost {
  employerPostId: number;
  title: string;
  employerEmail: string;
  employerName?: string | null;
  categoryName?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminEmployerPostDetail extends AdminEmployerPost {
  description?: string | null;
  salary?: number | null;
  requirements?: string | null;
  workHours?: string | null;
  phoneContact?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
}

export interface AdminJobSeekerPost {
  jobSeekerPostId: number;
  title: string;
  jobSeekerEmail: string;
  fullName?: string | null;
  categoryName?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminJobSeekerPostDetail extends AdminJobSeekerPost {
  description?: string | null;
  preferredWorkHours?: string | null;
  gender?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
}

export interface AdminPostFilters {
  status?: string;
  categoryId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export type AdminPostPagedResult<T> = PagedResult<T>;
