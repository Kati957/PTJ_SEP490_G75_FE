import baseService from '../../../services/baseService';
import type { AdminUser, AdminUserDetail, AdminUserFilters } from '../types/user';
import { adaptPagedResult, type RawPagedResponse, type PagedResult } from './pagedResultHelper';

const buildQuery = (filters: AdminUserFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== 'all') {
    params.append('role', filters.role);
  }
  if (typeof filters.isActive === 'boolean') {
    params.append('isActive', filters.isActive.toString());
  }
  if (typeof filters.isVerified === 'boolean') {
    params.append('isVerified', filters.isVerified.toString());
  }
  if (filters.keyword) {
    params.append('keyword', filters.keyword.trim());
  }
  params.append('page', String(filters.page ?? 1));
  params.append('pageSize', String(filters.pageSize ?? 10));
  const query = params.toString();
  return query ? `?${query}` : '';
};

const adminUserService = {
  async getUsers(filters: AdminUserFilters = {}): Promise<PagedResult<AdminUser>> {
    const response = await baseService.get<RawPagedResponse<AdminUser>>(
      `/admin/users${buildQuery(filters)}`
    );
    return adaptPagedResult<AdminUser>(response);
  },

  async getUserDetail(id: number): Promise<AdminUserDetail> {
    return await baseService.get<AdminUserDetail>(`/admin/users/${id}`);
  },

  async toggleActive(id: number): Promise<void> {
    await baseService.post(`/admin/users/${id}/toggle-active`);
  }
};

export default adminUserService;
