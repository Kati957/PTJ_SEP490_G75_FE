export interface AdminEmployerPostView {
  employerPostId: number;
  title: string;
  employerUserId: number;
  employerEmail: string;
  employerName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  status: string;
  createdAt: string;
}

export interface AdminEmployerPostDetailView extends AdminEmployerPostView {
  description?: string;
  salary?: number;
  requirements?: string;
  workHours?: string;
  location?: string;
  phoneContact?: string;
}

export interface AdminEmployerPostResponse {
  data: AdminEmployerPostView[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminEmployerJobsState {
  posts: AdminEmployerPostView[];
  totalRecords: number;
  page: number;
  pageSize: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedPost: AdminEmployerPostDetailView | null; 
}

export interface FetchAdminEmployerPostsParams {
  status?: string;
  categoryId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export type AdminEmployerPostDetailResponse = AdminEmployerPostDetailView;

export interface ToggleBlockResponse {
  message: string;
}