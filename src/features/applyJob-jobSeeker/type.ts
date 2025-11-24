// Định nghĩa kiểu dữ liệu cho request body khi nộp đơn
export interface ApplyJobPayload {
  jobSeekerId: number;
  employerPostId: number;
  cvid: number;
  note?: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API lấy danh sách công việc đã ứng tuyển
export interface JobApplicationResultDto {
  candidateListId: number;
  jobSeekerId: number;
  jobSeekerPostId?: number;
  cvId?: number | null;
  selectedCvId?: number | null;
  cvid?: number | null;
  username: string;
  status: string;
  applicationDate: string;
  notes: string;
  employerPostId: number;
  postTitle: string;
  categoryName: string;
  employerName: string;
  location: string;
  salary: number;
  workHours: string;
  phoneContact: string;
  companyLogo?: string | null;
}

// Định nghĩa kiểu dữ liệu cho response của API
export interface AppliedJobsResponse {
  success: boolean;
  total: number;
  data: JobApplicationResultDto[];
}
