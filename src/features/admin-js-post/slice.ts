import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "./service";
import type {
  AdminJobsState,
  FetchAdminPostsParams,
  AdminJobPostResponse,
  AdminJobPostDetailResponse,
} from "./type";
import type { RootState } from "../../app/store";
import { message } from "antd";

type ApiError = { response?: { data?: { message?: string } }; message?: string };

const initialState: AdminJobsState = {
  posts: [],
  totalRecords: 0,
  page: 1,
  pageSize: 10,
  status: "idle",
  error: null,
};
export const fetchAdminEmployerPosts = createAsyncThunk<
  AdminJobPostResponse,
  FetchAdminPostsParams,
  { rejectValue: string }
>("admin/fetchEmployerPosts", async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getJobSeekerPosts(params);
    return data;
  } catch (err: unknown) {
    const error = err as ApiError;
    message.error(error?.response?.data?.message || "Không thể tải danh sách.");
    return rejectWithValue(error?.message || "Request failed");
  }
});

export const toggleEmployerPostBlock = createAsyncThunk<
  AdminJobPostDetailResponse,
  number,
  { rejectValue: string }
>("admin/toggleEmployerPostBlock", async (id, { rejectWithValue }) => {
  try {
    await adminService.toggleJobSeekerPostBlock(id);

    const updatedPost = await adminService.getJobSeekerPostDetail(id);

    message.success("Cập nhật trạng thái thành công.");
    return updatedPost;
  } catch (err: unknown) {
    const error = err as ApiError;
    message.error(error?.response?.data?.message || "Cập nhật thất bại.");
    return rejectWithValue(error?.message || "Request failed");
  }
});

const adminSlice = createSlice({
  name: "adminJobs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmployerPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminEmployerPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.data ?? [];
        state.totalRecords = action.payload.totalRecords ?? 0;
        state.page = action.payload.page ?? 1;
        state.pageSize = action.payload.pageSize ?? 10;
      })
      .addCase(fetchAdminEmployerPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(toggleEmployerPostBlock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleEmployerPostBlock.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.posts.findIndex(
          (p) => p.jobSeekerPostId === action.payload.jobSeekerPostId
        );
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(toggleEmployerPostBlock.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const selectAdminJobPosts = (state: RootState) => state.adminJobs.posts;
export const selectAdminJobStatus = (state: RootState) =>
  state.adminJobs.status;

export default adminSlice.reducer;
