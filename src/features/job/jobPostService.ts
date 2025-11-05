import baseService from '../../services/baseService';
import type { DeleteJobResponse, EmployerPostDto, JobPostResponse, PaginatedJobResponse, UpdateJobResponse } from './jobTypes';


export const createJobPost = async (data: EmployerPostDto): Promise<JobPostResponse> => {
  return await baseService.post<JobPostResponse>('/EmployerPost/create', data);
};


export const getJobsByUser = async (userID: number): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>(`/EmployerPost/by-user/${userID}`);
};

export const getJobById = async (id: number): Promise<JobPostResponse> => {
  return await baseService.get<JobPostResponse>(`/EmployerPost/${id}`);
};

export const updateJobPost = async (id: number, data: EmployerPostDto): Promise<UpdateJobResponse> => {
  return await baseService.put<UpdateJobResponse>(`/EmployerPost/${id}`, data);
};

export const deleteJobPost = async (id: number): Promise<DeleteJobResponse> => {
  return await baseService.del<DeleteJobResponse>(`/EmployerPost/${id}`);
};

export const getAllJobs = async (): Promise<PaginatedJobResponse> => {
  return await baseService.get<PaginatedJobResponse>('/EmployerPost/all');
};


export const jobPostService = {
  createJobPost,
  getJobsByUser,
  updateJobPost,
  deleteJobPost,
  getJobById,
};

export default jobPostService;
