import type { SavedJob } from './types';
import { mockJobs } from '../findJob-jobSeeker/mockData';
import baseService from '../../services/baseService';
import { store } from '../../app/store';

// Mock API: Lấy danh sách các công việc đã lưu
export const getSavedJobs = async (): Promise<SavedJob[]> => {
  console.log('Fetching saved jobs...');
  // Giả lập một cuộc gọi API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Trả về một danh sách các công việc đã được "lưu" từ mockData
  const savedJobs: SavedJob[] = mockJobs.slice(0, 3).map(job => ({
    ...job,
    savedAt: new Date().toISOString(), // Thêm ngày lưu là ngày hiện tại
  }));
  
  console.log('Fetched saved jobs:', savedJobs);
  return savedJobs;
};

// Mock API: Lưu một công việc
export const saveJob = async (jobId: string): Promise<{ success: true }> => {
  console.log(`Saving job with id: ${jobId}`);
  try {
    const jobSeekerId = store.getState().auth.user?.id || 0; // Lấy jobSeekerId từ Redux store
    const payload = {
      jobSeekerId: jobSeekerId,
      employerPostId: parseInt(jobId), // Chuyển jobId sang số nguyên
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

// Mock API: Bỏ lưu một công việc
export const unsaveJob = async (jobId: string): Promise<{ success: true }> => {
  console.log(`Unsaving job with id: ${jobId}`);
  try {
    const jobSeekerId = store.getState().auth.user?.id || 0; // Lấy jobSeekerId từ Redux store
    const payload = {
      jobSeekerId: jobSeekerId,
      employerPostId: parseInt(jobId),
      note: null, // Thêm note: null theo yêu cầu
    };
    // Sử dụng endpoint và method POST theo yêu cầu
    await baseService.post('https://localhost:7100/api/JobSeekerPost/unsave-job', payload);
    console.log(`Job ${jobId} unsaved successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to unsave job ${jobId}:`, error);
    throw error;
  }
};
