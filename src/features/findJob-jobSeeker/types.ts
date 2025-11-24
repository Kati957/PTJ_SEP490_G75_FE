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
  requirements?: string;
  workHours?: string;
  location?: string;
  phoneContact?: string;
  categoryName?: string;
  employerName?: string;
  createdAt: string; 
  status: string;
  companyLogo?: string;
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

export type SalaryFilter =
  | "all"
  | "hasValue"
  | "negotiable"
  | "0-10"
  | "10-15"
  | "15-20"
  | "20-25"
  | "25+";

export interface JobSearchFilters {
  keyword: string;
  provinceId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
  salary: SalaryFilter;
}
