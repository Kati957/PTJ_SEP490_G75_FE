import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getAllJobSeekerPosts } from './services';
import type { JobSeekerPost } from '../jobSeekerPosting/types';

interface JobSeekerPostListState {
  posts: JobSeekerPost[];
  loading: boolean;
  error: string | null;
}

const initialState: JobSeekerPostListState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchAllJobSeekerPosts = createAsyncThunk(
  'jobSeekerPostList/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const posts = await getAllJobSeekerPosts();
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách bài đăng');
    }
  }
);

const jobSeekerPostListSlice = createSlice({
  name: 'jobSeekerPostList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllJobSeekerPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobSeekerPosts.fulfilled, (state, action: PayloadAction<JobSeekerPost[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAllJobSeekerPosts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default jobSeekerPostListSlice.reducer;

