import baseService from '../../../../services/baseService';
import type { EmployerPostDto, JobPostResponse } from './jobTypes';


export const createJobPost = async (data: EmployerPostDto): Promise<JobPostResponse> => {
  return await baseService.post<JobPostResponse>('/EmployerPost/create', data);
};


export const getJobsByEmployer = async (userID: number): Promise<JobPostResponse> => {
  return await baseService.get<JobPostResponse>(`/Employer/jobs/${userID}`);
};


export const getJobById = async (jobId: number): Promise<JobPostResponse> => {
  return await baseService.get<JobPostResponse>(`/Employer/job/${jobId}`);
};

export const deleteJobPost = async (jobId: number): Promise<JobPostResponse> => {
  return await baseService.del<JobPostResponse>(`/Employer/job/${jobId}`);
};

export const jobPostService = {
  createJobPost,
  getJobsByEmployer,
  getJobById,
  deleteJobPost,
};

export default jobPostService;
