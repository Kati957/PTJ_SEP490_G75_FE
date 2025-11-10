export interface AdminCategory {
  categoryId: number;
  name: string;
  description?: string | null;
  type?: string | null;
  isActive: boolean;
  createdAt?: string | null;
}

export interface AdminCategoryDetail extends AdminCategory {}

export interface AdminCreateCategoryPayload {
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

export interface AdminUpdateCategoryPayload extends AdminCreateCategoryPayload {}

export interface AdminCategoryFilters {
  type?: string;
  isActive?: boolean | null;
  keyword?: string;
}
