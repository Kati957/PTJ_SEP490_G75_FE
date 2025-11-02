// DTO (Data Transfer Object) - Cấu trúc gửi lên Backend
export interface EmployerPostDto {
  userID: number;
  title: string;
  description: string | null;
  salary: number | null;
  requirements: string | null;
  workHours: string | null;
  location: string | null;
  categoryID: number | null;
  phoneContact: string | null;
}

// Interface cho State của Form (chỉ dùng ở Frontend)
export interface JobPostData {
  jobTitle: string;
  jobDescription: string;
  salaryValue: number | null;
  requirements: string;
  workHours: string;
  location: string;
  categoryID: number | null;
  contactPhone: string;
  salaryType: 'negotiable' | 'range' | 'exact' | 'competitive';
}

// Interface cho dữ liệu trả về từ API (dựa trên Controller của bạn)
export interface JobPostResponse {
  success: boolean;
  message: string;
  data: any; // Hoặc một kiểu dữ liệu cụ thể cho bài post đã tạo
}