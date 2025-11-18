import baseService from '../../../services/baseService';
import { adaptPagedResult, type RawPagedResponse, type PagedResult } from './pagedResultHelper';
import type {
  AdminEmployerPost,
  AdminEmployerPostDetail,
  AdminJobSeekerPost,
  AdminJobSeekerPostDetail,
  AdminPostFilters
} from '../types/jobPost';

const buildQuery = (filters: AdminPostFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (typeof filters.categoryId === 'number') {
    params.append('categoryId', String(filters.categoryId));
  }
  if (filters.keyword) {
    params.append('keyword', filters.keyword.trim());
  }
  params.append('page', String(filters.page ?? 1));
  params.append('pageSize', String(filters.pageSize ?? 10));
  const query = params.toString();
  return query ? `?${query}` : '';
};

const adminJobPostService = {
  async getEmployerPosts(filters: AdminPostFilters = {}): Promise<PagedResult<AdminEmployerPost>> {
    const response = await baseService.get<RawPagedResponse<AdminEmployerPost>>(
      `/admin/jobposts/employer${buildQuery(filters)}`
    );
    return adaptPagedResult(response);
  },

  async getEmployerPostDetail(id: number): Promise<AdminEmployerPostDetail> {
    return await baseService.get<AdminEmployerPostDetail>(`/admin/jobposts/employer/${id}`);
  },

  async toggleEmployerPostBlocked(id: number, reason?: string): Promise<void> {
    await baseService.post(`/admin/jobposts/employer/${id}/toggle-block`, {
      reason: reason?.trim() ?? ''
    });
  },

  async getJobSeekerPosts(filters: AdminPostFilters = {}): Promise<PagedResult<AdminJobSeekerPost>> {
    const response = await baseService.get<RawPagedResponse<AdminJobSeekerPost>>(
      `/admin/jobposts/jobseeker${buildQuery(filters)}`
    );
    return adaptPagedResult(response);
  },

  async getJobSeekerPostDetail(id: number): Promise<AdminJobSeekerPostDetail> {
    return await baseService.get<AdminJobSeekerPostDetail>(`/admin/jobposts/jobseeker/${id}`);
  },

  async toggleJobSeekerPostArchived(id: number, reason?: string): Promise<void> {
    await baseService.post(`/admin/jobposts/jobseeker/${id}/toggle-archive`, {
      reason: reason?.trim() ?? ''
    });
  }
};

export default adminJobPostService;
