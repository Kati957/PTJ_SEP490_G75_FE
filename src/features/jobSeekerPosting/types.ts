/**
 * Đây là kiểu dữ liệu (payload) được sử dụng khi gửi yêu cầu tạo một bài đăng tìm việc mới.
 */
export interface CreateJobSeekerPostPayload {
  userID: number;
  title: string;
  description: string;
  age: number;
  gender: string;
  preferredWorkHours: string;
  preferredLocation: string;
  categoryID: number;
  phoneContact: string;
}

export interface UpdateJobSeekerPostPayload extends CreateJobSeekerPostPayload {
  jobSeekerPostId: number;
}


/**
 * Định nghĩa kiểu dữ liệu cho một tỉnh/thành phố từ API public.
 */
export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

/**
 * Định nghĩa kiểu dữ liệu cho một bài đăng tìm việc của Job Seeker từ API.
 */
export interface JobSeekerPost {
  jobSeekerPostId: number;
  userID: number;
  title: string;
  description: string;
  age: number;
  gender: string;
  preferredWorkHours: string;
  preferredLocation: string;
  phoneContact: string;
  categoryName: string;
  seekerName: string;
  createdAt: string;
  status: string;
  
}

export interface GetJobByIdResponse {
  success: boolean;
  data: JobSeekerPost;
}