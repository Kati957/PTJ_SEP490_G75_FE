export interface SubCategory {
  subCategoryId: number;
  categoryId: number;
  name: string;
  keywords?: string | null;
  isActive?: boolean | null;
}

export interface SubCategoryCreateDto {
  name: string;
  categoryId: number;
  description?: string | null;
  isActive?: boolean;
}

export interface SubCategoryUpdateDto {
  name?: string;
  categoryId?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface SubCategoryFilterDto {
  name?: string;
  categoryId?: number;
}

export interface SubCategoryState {
  all: SubCategory[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  byCategory: Record<number, SubCategory[]>;
  statusByCategory: Record<number, "idle" | "loading" | "succeeded" | "failed">;
}
