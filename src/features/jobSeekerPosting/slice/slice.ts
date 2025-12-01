import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { createJobSeekerPost, getJobById, updateJobSeekerPost, deleteJobSeekerPost, getJobSuggestions } from '../services';
import type { CreateJobSeekerPostPayload, JobSeekerPost, UpdateJobSeekerPostPayload } from '../types';
import type { Job } from '../../../types';
import {
  formatSalaryText,
  getCompanyLogoSrc,
  getJobDetailCached,
} from '../../../utils/jobPostHelpers';

interface JobSeekerPostingState {
  create: {
    loading: boolean;
    error: string | null;
    errorStatus: number | null;
    success: boolean;
  };
  detail: {
    post: JobSeekerPost | null;
    loading: boolean;
    error: string | null;
  };
  delete: {
    loading: boolean;
    error: string | null;
    errorStatus: number | null;
    success: boolean;
  };
  suggestions: {
    jobs: Job[];
    loading: boolean;
    error: string | null;
  };
}

const initialState: JobSeekerPostingState = {
  create: {
    loading: false,
    error: null,
    errorStatus: null,
    success: false,
  },
  detail: {
    post: null,
    loading: false,
    error: null,
  },
  delete: {
    loading: false,
    error: null,
    errorStatus: null,
    success: false,
  },
  suggestions: {
    jobs: [],
    loading: false,
    error: null,
  }
};

export const createPosting = createAsyncThunk(
  'jobSeekerPosting/create',
  async (payload: CreateJobSeekerPostPayload, { rejectWithValue }) => {
    try {
      const response = await createJobSeekerPost(payload);
      return response; // Dữ liệu trả về từ API khi thành công
    } catch (error: any) {
      const defaultMessage = 'Tạo bài đăng thất bại';
      let friendlyMessage = error.response?.data?.message || defaultMessage;
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const flattened = Object.values(serverErrors)
          .flat()
          .filter((msg): msg is string => typeof msg === 'string');
        if (flattened.length > 0) {
          friendlyMessage = flattened.join('\n');
        }
      }
      return rejectWithValue({
        message: friendlyMessage,
        status: error.response?.status ?? null,
      });
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

export const deletePosting = createAsyncThunk(
  'jobSeekerPosting/delete',
  async (jobSeekerPostId: number, { rejectWithValue }) => {
    try {
      const response = await deleteJobSeekerPost(jobSeekerPostId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa bài đăng thất bại');
    }
  }
);

export const fetchPostSuggestions = createAsyncThunk(
  'jobSeekerPosting/fetchSuggestions',
  async (jobSeekerPostId: number, { rejectWithValue }) => {
    try {
      const response = await getJobSuggestions(jobSeekerPostId);

      if (response.success && Array.isArray(response.data)) {
          const mappedJobs: Job[] = await Promise.all(
            response.data.map(async (item) => {
              const detail = await getJobDetailCached(item.employerPostId?.toString?.() ?? '');
              const logoSrc = getCompanyLogoSrc(detail?.companyLogo);
              const salaryText = formatSalaryText(
                detail?.salaryMin,
                detail?.salaryMax,
                detail?.salaryType,
                detail?.salaryDisplay
              );

              return {
                id: item.employerPostId.toString(),
                title: item.title || 'Cong viec goi y',
                description: item.description || '',
                company: item.employerName || null,
                location: item.location || null,
                salary: salaryText,
                updatedAt: item.createdAt,
                companyLogo: logoSrc,
                isHot: item.matchPercent >= 90,
              };
            })
          );
        return mappedJobs;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Khong the tai danh sach goi y');
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
      state.create.errorStatus = null;
      state.create.success = false;

      state.delete.loading = false;
      state.delete.error = null;
      state.delete.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPosting.pending, (state) => {
      state.create.loading = true;
      state.create.error = null;
      state.create.errorStatus = null;
      state.create.success = false;
    })
    .addCase(createPosting.fulfilled, (state) => {
      state.create.loading = false;
      state.create.errorStatus = null;
      state.create.success = true;
    })
    .addCase(createPosting.rejected, (state, action: PayloadAction<any>) => {
      state.create.loading = false;
      if (typeof action.payload === 'object') {
        state.create.error = action.payload.message;
        state.create.errorStatus = action.payload.status ?? null;
      } else {
        state.create.error = action.payload;
        state.create.errorStatus = null;
      }
    })
      // Reducers for updating post
      .addCase(updatePosting.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.errorStatus = null;
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
      })
      .addCase(deletePosting.pending, (state) => {
        state.delete.loading = true;
        state.delete.error = null;
        state.delete.success = false;
      })
      .addCase(deletePosting.fulfilled, (state) => {
        state.delete.loading = false;
        state.delete.success = true;
      })
      .addCase(deletePosting.rejected, (state, action: PayloadAction<any>) => {
        state.delete.loading = false;
        state.delete.error = action.payload;
      })
      .addCase(fetchPostSuggestions.pending, (state) => {
        state.suggestions.loading = true;
        state.suggestions.error = null;
      })
      .addCase(fetchPostSuggestions.fulfilled, (state, action) => {
        state.suggestions.loading = false;
        state.suggestions.jobs = action.payload;
      })
      .addCase(fetchPostSuggestions.rejected, (state, action: PayloadAction<any>) => {
        state.suggestions.loading = false;
        state.suggestions.error = action.payload;
      });
  },
});

export const { resetPostStatus } = jobSeekerPostingSlice.actions;
export default jobSeekerPostingSlice.reducer;

