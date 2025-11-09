export interface AdminJobPostView {
  id: number;
  title: string;
  employerUserId: number;
  employerEmail: string;
  employerName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  status: string;
  createdAt: string;
}


export type AdminJobPostResponse = AdminJobPostView[];

export interface AdminJobsState {
  posts: AdminJobPostView[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface FetchAdminPostsParams {
  status?: string;
  categoryId?: number;
  keyword?: string;
}

export type AdminJobPostDetailResponse = AdminJobPostView;

export interface ToggleBlockResponse {
  message: string;
}