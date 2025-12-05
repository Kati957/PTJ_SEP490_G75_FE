export interface AdminCategory {
  categoryId: number;
  name: string;
  description?: string | null;
  type?: string | null;
  isActive: boolean;
  createdAt?: string | null;
}

export type AdminCategoryDetail = AdminCategory;

export interface AdminCreateCategoryPayload {
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

export type AdminUpdateCategoryPayload = AdminCreateCategoryPayload;

export interface AdminCategoryFilters {
  type?: string;
  isActive?: boolean | null;
  keyword?: string;
}
