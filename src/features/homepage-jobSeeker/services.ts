import baseService from '../../services/baseService';
import type { Job } from '../../types/index';

// Định nghĩa kiểu dữ liệu cho một công việc từ API backend
interface BackendJob {
  employerPostId: number;
  employerId: number;
  title: string;
  description: string;
  salary: number;
  workHours: string;
  location: string;
  phoneContact: string;
  categoryName: string;
  employerName: string;
  createdAt: string; // Giữ nguyên kiểu string để xử lý sau
  status: string;
}

// Định nghĩa kiểu dữ liệu cho response từ API
interface ApiResponse {
  success: boolean;
  total: number;
  data: BackendJob[];
}

/**
 * Ánh xạ dữ liệu công việc từ backend sang định dạng Job của frontend.
 * @param backendJob - Đối tượng công việc từ backend.
 * @returns - Đối tượng công việc đã được ánh xạ.
 */
const mapBackendJobToFrontendJob = (backendJob: BackendJob): Job => {
  return {
    id: backendJob.employerPostId.toString(),
    title: backendJob.title,
    description: backendJob.description,
    company: backendJob.employerName,
    location: backendJob.location,
    // Chuyển đổi salary từ number sang string theo format mong muốn
    salary: `Trên ${backendJob.salary} triệu`, 
    // Sử dụng createdAt cho updatedAt và sẽ được format bởi component
    updatedAt: backendJob.createdAt, 
    // Backend chưa có logo, dùng ảnh mặc định
    companyLogo: '/src/assets/no-logo.png', 
    // Backend chưa có isHot, tạm thời để true để demo
    isHot: true, 
  };
};


/**
 * Lấy danh sách các công việc nổi bật từ API.
 * @returns - Promise chứa danh sách các công việc đã được ánh xạ.
 */
export const getFeaturedJobs = async (): Promise<Job[]> => {
  try {
    // Gọi API bằng baseService
    const response = await baseService.get<ApiResponse>('/EmployerPost/all');

    // Kiểm tra nếu API trả về thành công và có dữ liệu
    if (response && response.success && Array.isArray(response.data)) {
      // Ánh xạ từng công việc trong danh sách trả về
      const featuredJobs = response.data.map(mapBackendJobToFrontendJob);
      return featuredJobs;
    }

    // Trả về mảng rỗng nếu không có dữ liệu hoặc có lỗi
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu featured jobs:', error);
    // Ném lỗi để slice hoặc component có thể xử lý
    throw error;
  }
};

// Tập hợp các service của feature homepage-jobSeeker
const homepageJobSeekerService = {
  getFeaturedJobs,
};

export default homepageJobSeekerService;
