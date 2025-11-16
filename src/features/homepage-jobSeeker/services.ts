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
    salary: backendJob.salary == 0 ? 'Thỏa thuận' : backendJob.salary.toString(), 
    updatedAt: backendJob.createdAt, 
    companyLogo: '/src/assets/no-logo.png', 
    isHot: true, 
  };
};


/**
 * Lấy danh sách các công việc nổi bật từ API.
 * @returns - Promise chứa danh sách các công việc đã được ánh xạ.
 */
export const getFeaturedJobs = async (): Promise<Job[]> => {
  try {
    const response = await baseService.get<ApiResponse>('/EmployerPost/all');

    if (response && response.success && Array.isArray(response.data)) {
      const featuredJobs = response.data.map(mapBackendJobToFrontendJob);
      return featuredJobs;
    }

    return [];
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu featured jobs:', error);
    throw error;
  }
};

const homepageJobSeekerService = {
  getFeaturedJobs,
};

export default homepageJobSeekerService;
