import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployerFullDetail } from './services';
import type { EmployerDetailState } from './types';

const initialState: EmployerDetailState = {
  profile: null,
  jobs: [],
  loading: false,
  error: null,
};

export const fetchEmployerDetailById = createAsyncThunk(
  'employerDetail/fetchById',
  async (userId: number | string, { rejectWithValue }) => {
    try {
      const data = await getEmployerFullDetail(userId);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Lỗi khi tải thông tin nhà tuyển dụng';
      return rejectWithValue(message);
    }
  }
);

const employerDetailSlice = createSlice({
  name: 'employerDetail',
  initialState,
  reducers: {
    clearEmployerDetail: (state) => {
      state.profile = null;
      state.jobs = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployerDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.jobs = action.payload.jobs;
      })
      .addCase(fetchEmployerDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmployerDetail } = employerDetailSlice.actions;
export default employerDetailSlice.reducer;
