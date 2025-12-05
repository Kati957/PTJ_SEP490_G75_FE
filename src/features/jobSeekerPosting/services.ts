import type { AxiosRequestHeaders } from 'axios';
import axios from 'axios';
import baseService from '../../services/baseService';
import type { CreateJobSeekerPostPayload, Province, JobSeekerPost, GetJobByIdResponse, UpdateJobSeekerPostPayload, JobSuggestionResponse } from './types';

const PROVINCES_API_URL = 'https://provinces.open-api.vn/api/p/';

interface ApiResponse<T> {
    success: boolean;
    total: number;
    data: T;
}

const appendIfDefined = (formData: FormData, key: string, value?: string | number | null) => {
  if (value === null || value === undefined) return;
  formData.append(key, String(value));
};

const buildJobSeekerPostFormData = (payload: CreateJobSeekerPostPayload): FormData => {
  const formData = new FormData();
  appendIfDefined(formData, 'UserID', payload.userID);
  formData.append('Title', payload.title ?? '');
  formData.append('Description', payload.description ?? '');
  appendIfDefined(formData, 'Age', payload.age);
  formData.append('Gender', payload.gender ?? '');
  formData.append('PreferredWorkHourStart', payload.preferredWorkHourStart ?? '');
  formData.append('PreferredWorkHourEnd', payload.preferredWorkHourEnd ?? '');
  appendIfDefined(formData, 'ProvinceId', payload.provinceId);
  appendIfDefined(formData, 'DistrictId', payload.districtId);
  appendIfDefined(formData, 'WardId', payload.wardId);
  formData.append('PreferredLocation', payload.preferredLocation ?? '');
  appendIfDefined(formData, 'CategoryID', payload.categoryID);
  formData.append('PhoneContact', payload.phoneContact ?? '');
  appendIfDefined(formData, 'SelectedCvId', payload.selectedCvId ?? null);
  return formData;
};

/**
 * Gửi yêu cầu tạo một bài đăng tìm việc mới của Job Seeker.
 * @param payload - Dữ liệu của bài đăng cần tạo.
 * @returns - Promise chứa dữ liệu trả về từ server.
 */
export const createJobSeekerPost = (payload: CreateJobSeekerPostPayload) => {
  const formData = buildJobSeekerPostFormData(payload);
  return baseService.post('/JobSeekerPost/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders,
  });
};

/**
 * Gửi yêu cầu cập nhật một bài đăng tìm việc.
 * @param payload - Dữ liệu của bài đăng cần cập nhật.
 */
export const updateJobSeekerPost = (payload: UpdateJobSeekerPostPayload) => {
  const formData = buildJobSeekerPostFormData(payload);
  return baseService.put(`/JobSeekerPost/${payload.jobSeekerPostId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders,
  });
};

/**
 * Gửi yêu cầu xóa một bài đăng tìm việc.
 * @param jobSeekerPostId - ID của bài đăng cần xóa.
 */
export const deleteJobSeekerPost = (jobSeekerPostId: number) => {
  return baseService.del(`/JobSeekerPost/${jobSeekerPostId}`);
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

export const getJobById = async (id: number): Promise<GetJobByIdResponse> => {
  return await baseService.get<GetJobByIdResponse>(`/JobSeekerPost/${id}`);
};

export const getJobSuggestions = async (jobSeekerPostId: number, take = 10, skip = 0): Promise<JobSuggestionResponse> => {
  return await baseService.get<JobSuggestionResponse>(`/JobSeekerPost/${jobSeekerPostId}/suggestions?take=${take}&skip=${skip}`);
};

export const refreshJobSeekerSuggestions = async (jobSeekerPostId: number) => {
  return await baseService.post(`/JobSeekerPost/refresh/${jobSeekerPostId}`, {});
};
