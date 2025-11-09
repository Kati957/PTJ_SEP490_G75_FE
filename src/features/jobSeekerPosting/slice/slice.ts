import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { createJobSeekerPost, getJobById, updateJobSeekerPost } from '../services';
import type { CreateJobSeekerPostPayload, JobSeekerPost, UpdateJobSeekerPostPayload } from '../types';

interface JobSeekerPostingState {
  create: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  detail: {
    post: JobSeekerPost | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: JobSeekerPostingState = {
  create: {
    loading: false,
    error: null,
    success: false,
  },
  detail: {
    post: null,
    loading: false,
    error: null,
  },
};

export const createPosting = createAsyncThunk(
  'jobSeekerPosting/create',
  async (payload: CreateJobSeekerPostPayload, { rejectWithValue }) => {
    try {
      const response = await createJobSeekerPost(payload);
      return response; // Dữ liệu trả về từ API khi thành công
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo bài đăng thất bại');
    }
  }
);

export const updatePosting = createAsyncThunk(
  'jobSeekerPosting/update',
  async (payload: UpdateJobSeekerPostPayload, { rejectWithValue }) => {
    try {
      const response = await updateJobSeekerPost(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật bài đăng thất bại');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'jobSeekerPosting/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getJobById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chi tiết bài đăng');
    }
  }
);

const jobSeekerPostingSlice = createSlice({
  name: 'jobSeekerPosting',
  initialState,
  reducers: {
    resetPostStatus: (state) => {
      state.create.loading = false;
      state.create.error = null;
      state.create.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPosting.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.success = false;
      })
      .addCase(createPosting.fulfilled, (state) => {
        state.create.loading = false;
        state.create.success = true;
      })
      .addCase(createPosting.rejected, (state, action: PayloadAction<any>) => {
        state.create.loading = false;
        state.create.error = action.payload;
      })
      // Reducers for updating post
      .addCase(updatePosting.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.success = false;
      })
      .addCase(updatePosting.fulfilled, (state) => {
        state.create.loading = false;
        state.create.success = true;
      })
      .addCase(updatePosting.rejected, (state, action: PayloadAction<any>) => {
        state.create.loading = false;
        state.create.error = action.payload;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.post = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.post = action.payload.data;
      })
      .addCase(fetchPostById.rejected, (state, action: PayloadAction<any>) => {
        state.detail.loading = false;
        state.detail.error = action.payload;
      });
  },
});

export const { resetPostStatus } = jobSeekerPostingSlice.actions;
export default jobSeekerPostingSlice.reducer;
