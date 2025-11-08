import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SavedJob } from '../types';
import { getSavedJobs, saveJob, unsaveJob } from '../services';

interface SavedJobsState {
  jobs: SavedJob[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  total: number;
}

const initialState: SavedJobsState = {
  jobs: [],
  status: 'idle',
  error: null,
  total: 0,
};

// Async thunk để lấy danh sách công việc đã lưu
export const fetchSavedJobs = createAsyncThunk(
  'savedJobs/fetchSavedJobs',
  async (jobSeekerId: string, { rejectWithValue }) => {
    try {
      const response = await getSavedJobs(jobSeekerId);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch saved jobs.');
    }
  }
);

// Async thunk để lưu một công việc
export const addSavedJob = createAsyncThunk(
  'savedJobs/addSavedJob',
  async ({ jobSeekerId, jobId }: { jobSeekerId: string; jobId: string }, { rejectWithValue }) => {
    try {
      await saveJob(jobSeekerId, jobId);
      // Bạn có thể muốn fetch lại job vừa lưu hoặc nhận về từ response để thêm vào state
      // Ở đây, ta tạm trả về jobId để xử lý ở extraReducers nếu cần
      return jobId;
    } catch (error) {
      return rejectWithValue('Failed to save job.');
    }
  }
);

// Async thunk để bỏ lưu một công việc
export const removeSavedJob = createAsyncThunk(
  'savedJobs/removeSavedJob',
  async ({ jobSeekerId, jobId }: { jobSeekerId: string; jobId: string }, { rejectWithValue }) => {
    try {
      await unsaveJob(jobSeekerId, jobId);
      return jobId; // Trả về jobId của công việc đã bỏ lưu
    } catch (error) {
      return rejectWithValue('Failed to unsave job.');
    }
  }
);

const savedJobsSlice = createSlice({
  name: 'savedJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action: PayloadAction<{ jobs: SavedJob[]; total: number }>) => {
        state.status = 'succeeded';
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(removeSavedJob.fulfilled, (state, action: PayloadAction<string>) => {
        // Xóa công việc đã bỏ lưu khỏi danh sách trong state
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      })
      .addCase(addSavedJob.rejected, (state, action) => {
        // Xử lý khi lưu job thất bại
        state.error = action.payload as string;
      })
      .addCase(removeSavedJob.rejected, (state, action) => {
        // Xử lý khi bỏ lưu job thất bại
        state.error = action.payload as string;
      });
  },
});

export default savedJobsSlice.reducer;
