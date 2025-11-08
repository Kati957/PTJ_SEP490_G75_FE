import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { EmployerPostDtoOut } from './types';
import { getJobDetail } from './services';

interface JobDetailState {
  job: EmployerPostDtoOut | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: JobDetailState = {
  job: null,
  status: 'idle',
  error: null,
};

export const fetchJobDetail = createAsyncThunk(
  'jobDetail/fetchJobDetail',
  async (id: string) => {
    const response = await getJobDetail(id);
    return response;
  }
);

const jobDetailSlice = createSlice({
  name: 'jobDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobDetail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.job = action.payload;
      })
      .addCase(fetchJobDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default jobDetailSlice.reducer;
