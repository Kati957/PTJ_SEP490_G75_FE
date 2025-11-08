import type { SavedJob, GetSavedJobsResponse } from './types';
import baseService from '../../services/baseService';

// Lấy danh sách các công việc đã lưu từ backend
export const getSavedJobs = async (jobSeekerId: string): Promise<{ jobs: SavedJob[]; total: number }> => {
  console.log('Fetching saved jobs...');
  try {
    const response = await baseService.get<GetSavedJobsResponse>(`/JobSeekerPost/saved/${jobSeekerId}`);
    
    const savedJobs: SavedJob[] = response.data.map(backendJob => ({
      id: backendJob.employerPostId.toString(),
      title: backendJob.title,
      location: backendJob.location,
      company: backendJob.employerName,
      savedAt: backendJob.addedAt,
      updatedAt: backendJob.addedAt,
      description: null,
      salary: null, 
      companyLogo: null,
      isHot: false,
    }));
    return { jobs: savedJobs, total: response.total };
  } catch (error) {
    console.error('Failed to fetch saved jobs:', error);
    throw error;
  }
};


export const saveJob = async (jobSeekerId: string, jobId: string): Promise<{ success: true }> => {
  try {
    const payload = {
      jobSeekerId: jobSeekerId,
      employerPostId: parseInt(jobId),
      note: null,
    };
    await baseService.post('https://localhost:7100/api/JobSeekerPost/save-job', payload);
    console.log(`Job ${jobId} saved successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to save job ${jobId}:`, error);
    throw error;
  }
};

export const unsaveJob = async (jobSeekerId: string, jobId: string): Promise<{ success: true }> => {
  console.log(`Unsaving job with id: ${jobId}`);
  try {
    const payload = {
      jobSeekerId: jobSeekerId,
      employerPostId: parseInt(jobId),
      note: null,
    };
    await baseService.post('https://localhost:7100/api/JobSeekerPost/unsave-job', payload);
    console.log(`Job ${jobId} unsaved successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to unsave job ${jobId}:`, error);
    throw error;
  }
};
