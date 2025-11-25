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
  appendIfDefined(formData, 'Salary', data.salary);
  if (data.salaryText) {
    formData.append('SalaryText', data.salaryText);
  }
  formData.append('Requirements', data.requirements ?? '');
  formData.append('WorkHourStart', data.workHourStart ?? '');
  formData.append('WorkHourEnd', data.workHourEnd ?? '');
  appendIfDefined(formData, 'ProvinceId', data.provinceId);
  appendIfDefined(formData, 'DistrictId', data.districtId);
  appendIfDefined(formData, 'WardId', data.wardId);
  formData.append('DetailAddress', data.detailAddress ?? '');
  appendIfDefined(formData, 'CategoryID', data.categoryID);
  appendIfDefined(formData, 'SubCategoryId', data.subCategoryId ?? null);
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
    headers: { 'Content-Type': 'multipart/form-data' },
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
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteJobPost = async (id: number): Promise<DeleteJobResponse> => {
  return await baseService.del<DeleteJobResponse>(`/EmployerPost/${id}`);
};

export const getAllJobs = async (): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>('/EmployerPost/all');
};

export const updateStatus = async (id: number, status: 'Accepted' | 'Rejected', note: string = ''): Promise<ApplicationActionResponse> => {
  const payload: JobApplicationUpdateDto = { status, note };
  return await baseService.put<ApplicationActionResponse>(`/JobApplication/${id}/status`, payload);
};

export const getJobSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return await baseService.get<JobSuggestionResponse>(`/EmployerPost/${postId}/suggestions`);
};

export const getSuggestions = async (postId: number): Promise<JobSuggestionResponse> => {
  return getJobSuggestions(postId);
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
};

export default jobPostService;
