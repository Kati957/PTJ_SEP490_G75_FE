import type { AxiosRequestHeaders } from 'axios';
import baseService from '../../services/baseService';
import type {
  ApplicationActionResponse,
  DeleteJobResponse,
  EmployerPostDto,
  JobApplicationUpdateDto,
  JobPostResponse,
  PaginatedJobResponse,
  UpdateJobResponse,
  JobSuggestionResponse,
  JobStatusToggleResponse,
} from './jobTypes';

const appendIfDefined = (formData: FormData, key: string, value?: string | number | null) => {
  if (value === null || value === undefined) {
    return;
  }
  formData.append(key, String(value));
};

const buildEmployerPostFormData = (data: EmployerPostDto): FormData => {
  const formData = new FormData();

  appendIfDefined(formData, 'UserID', data.userID);
  formData.append('Title', data.title ?? '');
  formData.append('Description', data.description ?? '');
  appendIfDefined(formData, 'SalaryMin', data.salaryMin);
  appendIfDefined(formData, 'SalaryMax', data.salaryMax);
  appendIfDefined(formData, 'SalaryType', data.salaryType);
  formData.append('Requirements', data.requirements ?? '');
  formData.append('WorkHourStart', data.workHourStart ?? '');
  formData.append('WorkHourEnd', data.workHourEnd ?? '');
  appendIfDefined(formData, 'ProvinceId', data.provinceId);
  appendIfDefined(formData, 'DistrictId', data.districtId);
  appendIfDefined(formData, 'WardId', data.wardId);
  formData.append('DetailAddress', data.detailAddress ?? '');
  appendIfDefined(formData, 'CategoryID', data.categoryID);
  appendIfDefined(formData, 'ExpiredAt', data.expiredAt ?? null);
  formData.append('PhoneContact', data.phoneContact ?? '');

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append('Images', file);
    });
  }

  if (data.deleteImageIds && data.deleteImageIds.length > 0) {
    data.deleteImageIds.forEach((id) => {
      formData.append('DeleteImageIds', String(id));
    });
  }

  return formData;
};

export const createJobPost = async (data: EmployerPostDto): Promise<JobPostResponse> => {
  const formData = buildEmployerPostFormData(data);
  return await baseService.post<JobPostResponse>('/EmployerPost/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders,
  });
};

export const getJobsByUser = async (userID: number): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>(`/EmployerPost/by-user/${userID}`);
};

export const getJobById = async (id: number): Promise<JobPostResponse> => {
  return await baseService.get<JobPostResponse>(`/EmployerPost/${id}`);
};

export const updateJobPost = async (id: number, data: EmployerPostDto): Promise<UpdateJobResponse> => {
  const formData = buildEmployerPostFormData(data);
  return await baseService.put<UpdateJobResponse>(`/EmployerPost/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders,
  });
};

export const deleteJobPost = async (id: number): Promise<DeleteJobResponse> => {
  return await baseService.del<DeleteJobResponse>(`/EmployerPost/${id}`);
};

export const getAllJobs = async (): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>('/EmployerPost/all');
};

export const updateStatus = async (id: number, status: 'Accepted' | 'Rejected' | 'Interviewing', note: string = ''): Promise<ApplicationActionResponse> => {
  const payload: JobApplicationUpdateDto = { status, note };
  return await baseService.put<ApplicationActionResponse>(`/JobApplication/${id}/status`, payload);
};

export const getJobSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return await baseService.get<JobSuggestionResponse>(`/EmployerPost/${postId}/suggestions`);
};

export const getSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return getJobSuggestions(postId);
};

export const refreshAiSuggestions = async (postId: number) => {
  return await baseService.post(`/EmployerPost/refresh/${postId}`, {});
};

export const closeEmployerPost = async (id: number): Promise<JobStatusToggleResponse> => {
  return await baseService.put<JobStatusToggleResponse>(`/EmployerPost/${id}/close`, {});
};

export const reopenEmployerPost = async (id: number): Promise<JobStatusToggleResponse> => {
  return await baseService.put<JobStatusToggleResponse>(`/EmployerPost/${id}/reopen`, {});
};

export const jobPostService = {
  createJobPost,
  getJobsByUser,
  updateJobPost,
  deleteJobPost,
  getJobById,
  getAllJobs,
  updateStatus,
  getJobSuggestions,
  getSuggestions,
  refreshAiSuggestions,
  closeEmployerPost,
  reopenEmployerPost,
};

export default jobPostService;
