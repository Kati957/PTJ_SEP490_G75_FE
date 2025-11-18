import type { PagedResult } from '../services/pagedResultHelper';

export interface AdminReport {
  reportId: number;
  reportType: string;
  reporterEmail: string;
  targetUserEmail?: string | null;
  reason?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminSolvedReport {
  solvedReportId: number;
  reportId: number;
  actionTaken: string;
  adminEmail: string;
  targetUserEmail?: string | null;
  reportType?: string | null;
  reportReason?: string | null;
  reason?: string | null;
  solvedAt: string;
}

export interface AdminReportDetail {
  reportId: number;
  reportType: string;
  reporterEmail: string;
  targetUserEmail?: string | null;
  targetUserRole?: string | null;
  reason?: string | null;
  status: string;
  createdAt: string;
  employerPostId?: number | null;
  employerPostTitle?: string | null;
  jobSeekerPostId?: number | null;
  jobSeekerPostTitle?: string | null;
}

export interface AdminResolveReportPayload {
  affectedUserId?: number | null;
  affectedPostId?: number | null;
  affectedPostType?: 'EmployerPost' | 'JobSeekerPost';
  actionTaken: 'BanUser' | 'UnbanUser' | 'DeletePost' | 'Warn' | 'Ignore';
  reason?: string;
}

export interface AdminPendingReportFilters {
  reportType?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminSolvedReportFilters {
  adminEmail?: string;
  reportType?: string;
  page?: number;
  pageSize?: number;
}

export type AdminReportPagedResult<T> = PagedResult<T>;

export interface AdminSystemReport {
  reportId: number;
  userId: number;
  userEmail: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminSystemReportDetail extends AdminSystemReport {
  fullName?: string | null;
}

export interface AdminSystemReportFilters {
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminResolveSystemReportPayload {
  action: 'MarkSolved' | 'Ignore';
  note?: string;
}
