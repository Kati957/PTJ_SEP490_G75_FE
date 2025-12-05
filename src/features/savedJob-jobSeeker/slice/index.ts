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

export const fetchSavedJobs = createAsyncThunk(
  'savedJobs/fetchSavedJobs',
  async (jobSeekerId: string, { rejectWithValue }) => {
    try {
      const response = await getSavedJobs(jobSeekerId);
      return response;
    } catch {
      return rejectWithValue('Failed to fetch saved jobs.');
    }
  }
);

export const addSavedJob = createAsyncThunk(
  'savedJobs/addSavedJob',
  async ({ jobSeekerId, jobId }: { jobSeekerId: string; jobId: string }, { rejectWithValue }) => {
    try {
      await saveJob(jobSeekerId, jobId);
      return jobId;
    } catch {
      return rejectWithValue('Failed to save job.');
    }
  }
);

export const removeSavedJob = createAsyncThunk(
  'savedJobs/removeSavedJob',
  async ({ jobSeekerId, jobId }: { jobSeekerId: string; jobId: string }, { rejectWithValue }) => {
    try {
      await unsaveJob(jobSeekerId, jobId);
      return jobId;
    } catch {
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
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      })
      .addCase(addSavedJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeSavedJob.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default savedJobsSlice.reducer;
