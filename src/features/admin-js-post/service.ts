import baseService from '../../services/baseService';
import type { AdminJobPostDetailResponse, AdminJobPostResponse, FetchAdminPostsParams, ToggleBlockResponse } from './type';

const getJobSeekerPosts = async (params: FetchAdminPostsParams): Promise<AdminJobPostResponse> => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.categoryId) query.append('categoryId', params.categoryId.toString());
  if (params.keyword) query.append('keyword', params.keyword);
  
  const queryString = query.toString();

  const res = await baseService.get<AdminJobPostResponse>(`/admin/jobposts/jobseeker?${queryString}`);
  
  return res;
};

const getJobSeekerPostDetail = async (id: number): Promise<AdminJobPostDetailResponse> => {
  return await baseService.get<AdminJobPostDetailResponse>(`/Admin/jobposts/jobseeker/${id}`);
};

const toggleJobSeekerPostBlock = async (id: number): Promise<ToggleBlockResponse> => {
  return await baseService.post<ToggleBlockResponse>(`/Admin/jobposts/jobseeker/${id}/toggle-archive`, {});
};

export const adminService = {
  getJobSeekerPosts,
  getJobSeekerPostDetail,
  toggleJobSeekerPostBlock,
};