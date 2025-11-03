import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SavedJob } from '../types';
import { getSavedJobs, unsaveJob } from '../services';

// Định nghĩa kiểu cho trạng thái của slice
interface SavedJobsState {
  jobs: SavedJob[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Trạng thái ban đầu
const initialState: SavedJobsState = {
  jobs: [],
  status: 'idle',
  error: null,
};

// Async thunk để lấy danh sách công việc đã lưu
export const fetchSavedJobs = createAsyncThunk('savedJobs/fetchSavedJobs', async () => {
  const response = await getSavedJobs();
  return response;
});

// Async thunk để bỏ lưu một công việc
export const removeSavedJob = createAsyncThunk('savedJobs/removeSavedJob', async (jobId: string, { rejectWithValue }) => {
  try {
    await unsaveJob(jobId);
    return jobId;
  } catch (error) {
    return rejectWithValue('Failed to unsave job.');
  }
});

// Tạo slice
const savedJobsSlice = createSlice({
  name: 'savedJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý khi fetchSavedJobs đang chạy
      .addCase(fetchSavedJobs.pending, (state) => {
        state.status = 'loading';
      })
      // Xử lý khi fetchSavedJobs thành công
      .addCase(fetchSavedJobs.fulfilled, (state, action: PayloadAction<SavedJob[]>) => {
        state.status = 'succeeded';
        state.jobs = action.payload;
      })
      // Xử lý khi fetchSavedJobs thất bại
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch saved jobs.';
      })
      // Xử lý khi removeSavedJob thành công
      .addCase(removeSavedJob.fulfilled, (state, action: PayloadAction<string>) => {
        // Loại bỏ công việc khỏi danh sách
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      });
  },
});

export default savedJobsSlice.reducer;
