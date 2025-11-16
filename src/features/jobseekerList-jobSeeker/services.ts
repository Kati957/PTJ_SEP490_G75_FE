import baseService from '../../services/baseService';
import type { JobSeekerPost } from '../jobSeekerPosting/types';

interface ApiResponse<T> {
    success: boolean;
    total: number;
    data: T;
}

/**
 * Lấy tất cả các bài đăng tìm việc.
 * @returns - Promise chứa danh sách tất cả bài đăng.
 */
export const getAllJobSeekerPosts = async (): Promise<JobSeekerPost[]> => {
    const response = await baseService.get<ApiResponse<JobSeekerPost[]>>(`/JobSeekerPost/all`);
    return response?.data || [];
};

