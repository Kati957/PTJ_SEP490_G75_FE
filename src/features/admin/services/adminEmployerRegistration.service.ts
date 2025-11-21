import baseService from '../../../services/baseService';
import { adaptPagedResult, type PagedResult } from './pagedResultHelper';
import type {
  AdminEmployerRegDetail,
  AdminEmployerRegListItem,
  AdminEmployerRegListResponse,
  AdminEmployerRegStatus,
} from '../types/employerRegistration';

export interface AdminEmployerRegFilters {
  status?: AdminEmployerRegStatus | 'All';
  keyword?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = (filters: AdminEmployerRegFilters) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'All') params.set('status', filters.status);
  if (filters.keyword) params.set('keyword', filters.keyword.trim());
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return params.toString();
};

const getRequests = async (filters: AdminEmployerRegFilters = {}): Promise<PagedResult<AdminEmployerRegListItem>> => {
  const query = buildQuery(filters);
  const res = await baseService.get<AdminEmployerRegListResponse>(
    query ? `/admin/employer-registrations?${query}` : '/admin/employer-registrations'
  );
  return adaptPagedResult(res);
};

const getRequestDetail = async (id: number): Promise<AdminEmployerRegDetail> => {
  return baseService.get<AdminEmployerRegDetail>(`/admin/employer-registrations/${id}`);
};

const approveRequest = async (id: number): Promise<{ message: string }> => {
  return baseService.post(`/admin/employer-registrations/${id}/approve`);
};

const rejectRequest = async (id: number, reason: string): Promise<{ message: string }> => {
  return baseService.post(`/admin/employer-registrations/${id}/reject`, { reason });
};

const adminEmployerRegistrationService = {
  getRequests,
  getRequestDetail,
  approveRequest,
  rejectRequest,
};

export default adminEmployerRegistrationService;
