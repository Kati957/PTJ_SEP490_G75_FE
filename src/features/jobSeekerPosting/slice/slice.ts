import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { createJobSeekerPost } from '../services';
import type { CreateJobSeekerPostPayload } from '../types';

// Định nghĩa kiểu cho trạng thái của slice
interface JobSeekerPostingState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Trạng thái khởi tạo
const initialState: JobSeekerPostingState = {
  loading: false,
  error: null,
  success: false,
};

// Async Thunk để tạo bài đăng
export const createPosting = createAsyncThunk(
  'jobSeekerPosting/create',
  async (payload: CreateJobSeekerPostPayload, { rejectWithValue }) => {
    try {
      const response = await createJobSeekerPost(payload);
      return response; // Dữ liệu trả về từ API khi thành công
    } catch (error: any) {
      // Trả về lỗi để xử lý trong reducer
      return rejectWithValue(error.response?.data?.message || 'Tạo bài đăng thất bại');
    }
  }
);

const jobSeekerPostingSlice = createSlice({
  name: 'jobSeekerPosting',
  initialState,
  reducers: {
    // Reducer để reset lại trạng thái sau khi thực hiện xong
    resetPostStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPosting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPosting.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createPosting.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPostStatus } = jobSeekerPostingSlice.actions;
export default jobSeekerPostingSlice.reducer;
