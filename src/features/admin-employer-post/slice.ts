import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  AdminEmployerJobsState,
  AdminEmployerPostResponse,
  AdminEmployerPostDetailResponse,
  FetchAdminEmployerPostsParams,
} from "./type";
import { message } from "antd";
import { adminService } from "./service";
import type { RootState } from "../../app/store";

const initialState: AdminEmployerJobsState = {
  posts: [],
  totalRecords: 0,
  page: 1,
  pageSize: 10,
  status: "idle",
  error: null,
  selectedPost: null,
};

export const fetchAdminEmployerPosts = createAsyncThunk<
  AdminEmployerPostResponse,
  FetchAdminEmployerPostsParams | undefined,
  { rejectValue: string }
>("adminEmployer/fetchPosts", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await adminService.getEmployerPosts(params);
    return res;
  } catch (err: any) {
    message.error(err.response?.data?.message || "Không thể tải danh sách.");
    return rejectWithValue(err.message);
  }
});

export const fetchAdminEmployerPostDetail = createAsyncThunk<
  AdminEmployerPostDetailResponse,
  number,
  { rejectValue: string }
>("adminEmployer/fetchDetail", async (id, { rejectWithValue }) => {
  try {
    const res = await adminService.getEmployerPostDetail(id);
    return res;
  } catch (err: any) {
    message.error(err.response?.data?.message || "Không thể tải chi tiết.");
    return rejectWithValue(err.message);
  }
});

export const toggleBlockAndRefresh = createAsyncThunk<
  AdminEmployerPostDetailResponse,
  number,
  { rejectValue: string }
>("adminEmployer/toggleBlockAndRefresh", async (id, { rejectWithValue }) => {
  try {
    await adminService.toggleEmployerPostBlock(id);
    const updated = await adminService.getEmployerPostDetail(id);
    message.success("Cập nhật trạng thái thành công.");
    return updated;
  } catch (err: any) {
    message.error(err.response?.data?.message || "Cập nhật thất bại.");
    return rejectWithValue(err.message);
  }
});

const adminEmployerSlice = createSlice({
  name: "adminEmployer",
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmployerPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminEmployerPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.data;
        state.totalRecords = action.payload.totalRecords;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchAdminEmployerPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? null;
      })

      .addCase(fetchAdminEmployerPostDetail.pending, (state) => {
        state.status = "loading";
        state.selectedPost = null;
      })
      .addCase(fetchAdminEmployerPostDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedPost = action.payload;
      })
      .addCase(fetchAdminEmployerPostDetail.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(toggleBlockAndRefresh.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleBlockAndRefresh.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.posts.findIndex(
          (p) => p.employerPostId === action.payload.employerPostId
        );
        if (index !== -1) state.posts[index] = action.payload;
      })

      .addCase(toggleBlockAndRefresh.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearSelectedPost } = adminEmployerSlice.actions;
export const selectAdminEmployerPosts = (state: RootState) =>
  state.adminEmployer.posts;
export const selectAdminEmployerStatus = (state: RootState) =>
  state.adminEmployer.status;
export const selectAdminEmployerSelectedPost = (state: RootState) =>
  state.adminEmployer.selectedPost;

export default adminEmployerSlice.reducer;
