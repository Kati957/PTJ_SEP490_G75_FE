import baseService from '../../services/baseService';
import type { ApplyJobPayload, AppliedJobsResponse } from './type';

const applyJob = (payload: ApplyJobPayload) => {
  return baseService.post<unknown>('/JobApplication/apply', payload);
};

const withdrawApplication = (jobSeekerId: number, employerPostId: number) => {
  return baseService.put<unknown>(`/JobApplication/withdraw?jobSeekerId=${jobSeekerId}&employerPostId=${employerPostId}`);
};

const getAppliedJobsBySeeker = (jobSeekerId: number) => {
  return baseService.get<AppliedJobsResponse>(`/JobApplication/by-seeker/${jobSeekerId}`);
};

const applyJobService = {
  applyJob,
  withdrawApplication,
  getAppliedJobsBySeeker,
};

export default applyJobService;
