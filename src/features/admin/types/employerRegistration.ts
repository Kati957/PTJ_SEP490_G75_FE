import type { PagedResult } from '../services/pagedResultHelper';

export type AdminEmployerRegStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdminEmployerRegListItem {
  requestId: number;
  email: string;
  username: string;
  companyName: string;
  contactPhone: string;
  status: AdminEmployerRegStatus;
  createdAt: string;
}

export interface AdminEmployerRegDetail extends AdminEmployerRegListItem {
  companyDescription?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  address?: string | null;
  adminNote?: string | null;
  reviewedAt?: string | null;
}

export type AdminEmployerRegListResponse = PagedResult<AdminEmployerRegListItem>;
