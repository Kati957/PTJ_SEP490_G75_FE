export interface JobCategory {
  id: string;
  name: string;
  count: number;
}

export interface JobMajor {
  id: string;
  name: string;
  categories: JobCategory[];
}

export interface JobLocation {
  id: string;
  name: string;
  count: number;
}

export interface EmployerPostDtoOutResponse {
  success: boolean;
  data: EmployerPostDtoOut;
}

export interface EmployerPostDtoOut {
  employerPostId: number;
  employerId: number;
  title: string;
  description?: string;
  salary?: number;
  salaryText?: string | null;
  requirements?: string;
  workHours?: string;
  workHourStart?: string | null;
  workHourEnd?: string | null;
  location?: string;
  detailAddress?: string | null;
  phoneContact?: string;
  categoryName?: string;
  subCategoryName?: string | null;
  employerName?: string;
  createdAt: string; 
  status: string;
  companyLogo?: string;
  imageUrls?: string[];
}

export interface JobSearchFilters {
  keyword: string;
  provinceId: number | null;
  categoryId: number | null;
  categoryName?: string | null;
  subCategoryId: number | null;
  subCategoryName?: string | null;
  salary: "all" | "hasValue" | "negotiable";
}
