import baseService from '../../services/baseService';
import type { AdminJobPostDetailResponse, AdminJobPostResponse, FetchAdminPostsParams, ToggleBlockResponse } from './type';

const getEmployerPosts = async (params: FetchAdminPostsParams): Promise<AdminJobPostResponse> => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.categoryId) query.append('categoryId', params.categoryId.toString());
  if (params.keyword) query.append('keyword', params.keyword);
  
  const queryString = query.toString();

  const res = await baseService.get<AdminJobPostResponse>(`/admin/jobposts/employer?${queryString}`);
  
  return res;
};

const getEmployerPostDetail = async (id: number): Promise<AdminJobPostDetailResponse> => {
  return await baseService.get<AdminJobPostDetailResponse>(`/Admin/jobposts/employer/${id}`);
};

const toggleEmployerPostBlock = async (id: number): Promise<ToggleBlockResponse> => {
  return await baseService.post<ToggleBlockResponse>(`/Admin/jobposts/employer/${id}/toggle-block`, {});
};

export const adminService = {
  getEmployerPosts,
  getEmployerPostDetail,
  toggleEmployerPostBlock,
};