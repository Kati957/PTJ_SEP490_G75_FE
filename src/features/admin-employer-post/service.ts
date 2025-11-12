import baseService from '../../services/baseService';
import type { 
  AdminEmployerPostDetailResponse, 
  AdminEmployerPostResponse, 
  FetchAdminEmployerPostsParams, 
  ToggleBlockResponse 
} from './type';

const getEmployerPosts = async (params: FetchAdminEmployerPostsParams): Promise<AdminEmployerPostResponse> => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.categoryId) query.append('categoryId', params.categoryId.toString());
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.page) query.append('page', params.page.toString());
  if (params.pageSize) query.append('pageSize', params.pageSize.toString());
  
  const queryString = query.toString();

  const res = await baseService.get<AdminEmployerPostResponse>(`/Admin/jobposts/employer?${queryString}`);
  
  return res;
};

const getEmployerPostDetail = async (id: number): Promise<AdminEmployerPostDetailResponse> => {
  return await baseService.get<AdminEmployerPostDetailResponse>(`/Admin/jobposts/employer/${id}`);
};

const toggleEmployerPostBlock = async (id: number): Promise<ToggleBlockResponse> => {
  return await baseService.post<ToggleBlockResponse>(`/Admin/jobposts/employer/${id}/toggle-block`, {});
};

export const adminService = {
  getEmployerPosts,
  getEmployerPostDetail,
  toggleEmployerPostBlock,
};