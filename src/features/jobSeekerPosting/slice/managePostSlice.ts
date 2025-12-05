import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getPostsByUserId } from '../services';
import type { JobSeekerPost } from '../types';

interface ManagePostsState {
  posts: JobSeekerPost[];
  loading: boolean;
  error: string | null;
}

const initialState: ManagePostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPostsByUserId = createAsyncThunk<JobSeekerPost[], number, { rejectValue: string }>(
  'managePosts/fetchByUserId',
  async (userId: number, { rejectWithValue }) => {
    try {
      const posts = await getPostsByUserId(userId);
      return posts;
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        (error instanceof Error ? error.message : 'Không thể tải danh sách bài đăng');
      return rejectWithValue(message);
    }
  }
);

const managePostsSlice = createSlice({
  name: 'managePosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByUserId.fulfilled, (state, action: PayloadAction<JobSeekerPost[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPostsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Không thể tải danh sách bài đăng';
      });
  },
});

export default managePostsSlice.reducer;
