export interface AdminJobSeekerPostView {
  jobSeekerPostId: number;
  title: string;
  jobSeekerEmail: string;
  categoryName: string | null;
  status: string;
  createdAt: string;

  description?: string;
  preferredLocation?: string;
  preferredWorkHours?: string;
  gender?: string;
}


export interface AdminEmployerPostView {
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

export interface AdminJobPostResponse {
  data: AdminJobSeekerPostView[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminJobsState {
  posts: AdminJobSeekerPostView[];
  totalRecords: number;
  page: number;
  pageSize: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


export interface FetchAdminPostsParams {
  status?: string;
  categoryId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export type AdminJobPostDetailResponse = AdminJobSeekerPostView;

export interface ToggleBlockResponse {
  message: string;
}