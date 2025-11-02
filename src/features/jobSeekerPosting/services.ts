import axios from 'axios';
import baseService from '../../services/baseService';
import type { CreateJobSeekerPostPayload, Province, JobSeekerPost } from './types';

const PROVINCES_API_URL = 'https://provinces.open-api.vn/api/p/';

interface ApiResponse<T> {
    success: boolean;
    total: number;
    data: T;
}

/**
 * Gửi yêu cầu tạo một bài đăng tìm việc mới của Job Seeker.
 * @param payload - Dữ liệu của bài đăng cần tạo.
 * @returns - Promise chứa dữ liệu trả về từ server.
 */
export const createJobSeekerPost = (payload: CreateJobSeekerPostPayload) => {
  return baseService.post('/JobSeekerPost/create', payload);
};

/**
 * Lấy danh sách các tỉnh/thành phố từ API công khai.
 * @returns - Promise chứa danh sách các tỉnh/thành phố.
 */
export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const response = await axios.get<Province[]>(PROVINCES_API_URL);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
    throw error;
  }
};

/**
 * Lấy danh sách các bài đăng của một người tìm việc dựa trên userID.
 * @param userId - ID của người dùng.
 * @returns - Promise chứa danh sách bài đăng.
 */
export const getPostsByUserId = async (userId: number): Promise<JobSeekerPost[]> => {
    const response = await baseService.get<ApiResponse<JobSeekerPost[]>>(`/JobSeekerPost/by-user/${userId}`);
    if (response && response.success) {
        return response.data;
    }
    return [];
};
