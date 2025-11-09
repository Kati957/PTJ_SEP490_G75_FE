import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from './service';
import type { AdminJobsState, FetchAdminPostsParams, AdminJobPostResponse, AdminJobPostDetailResponse } from './type';
import type { RootState } from '../../app/store';
import { message } from 'antd';

const initialState: AdminJobsState = {
  posts: [],
  status: 'idle',
  error: null,
};

export const fetchAdminEmployerPosts = createAsyncThunk<
  AdminJobPostResponse,  
  FetchAdminPostsParams, 
  { rejectValue: string }
>(
  'admin/fetchEmployerPosts',
  async (params, { rejectWithValue }) => {
    try {
      const data = await adminService.getEmployerPosts(params);
      return data;
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách.');
      return rejectWithValue(err.message);
    }
  }
);

export const toggleEmployerPostBlock = createAsyncThunk<
  AdminJobPostDetailResponse,
  number,
  { rejectValue: string }
>(
  'admin/toggleEmployerPostBlock',
  async (id, { rejectWithValue }) => {
    try {
      await adminService.toggleEmployerPostBlock(id);
      
      const updatedPost = await adminService.getEmployerPostDetail(id);
      
      message.success('Cập nhật trạng thái thành công.');
      return updatedPost;
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại.');
      return rejectWithValue(err.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'adminJobs',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmployerPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminEmployerPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(fetchAdminEmployerPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(toggleEmployerPostBlock.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(toggleEmployerPostBlock.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(toggleEmployerPostBlock.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const selectAdminJobPosts = (state: RootState) => state.adminJobs.posts;
export const selectAdminJobStatus = (state: RootState) => state.adminJobs.status;

export default adminSlice.reducer;