import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createJobSeekerPost,
  deleteJobSeekerPost,
  getJobById,
  getJobSuggestions,
  updateJobSeekerPost,
} from '../services';
import type {
  CreateJobSeekerPostPayload,
  GetJobByIdResponse,
  JobSeekerPost,
  JobSuggestionData,
  UpdateJobSeekerPostPayload,
} from '../types';
import type { Job } from '../../../types';
import { formatSalaryText, getCompanyLogoSrc, getJobDetailCached } from '../../../utils/jobPostHelpers';

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

type CreateRejectPayload = { message: string; status: number | null } | string;

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
  },
};

const getErrorData = (error: unknown) =>
  (error as { response?: { data?: { message?: string; errors?: Record<string, unknown> }; status?: number } }).response;

export const createPosting = createAsyncThunk<void, CreateJobSeekerPostPayload, { rejectValue: CreateRejectPayload }>(
  'jobSeekerPosting/create',
  async (payload, { rejectWithValue }) => {
    try {
      await createJobSeekerPost(payload);
    } catch (error) {
      const response = getErrorData(error);
      const defaultMessage = 'Tạo bài đăng thất bại';
      let friendlyMessage = response?.data?.message || defaultMessage;
      const serverErrors = response?.data?.errors;
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
        status: response?.status ?? null,
      });
    }
  }
);

export const updatePosting = createAsyncThunk<void, UpdateJobSeekerPostPayload, { rejectValue: string }>(
  'jobSeekerPosting/update',
  async (payload, { rejectWithValue }) => {
    try {
      await updateJobSeekerPost(payload);
    } catch (error) {
      const response = getErrorData(error);
      return rejectWithValue(response?.data?.message || 'Cập nhật bài đăng thất bại');
    }
  }
);

export const fetchPostById = createAsyncThunk<GetJobByIdResponse, number, { rejectValue: string }>(
  'jobSeekerPosting/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getJobById(id);
      return response;
    } catch (error) {
      const response = getErrorData(error);
      return rejectWithValue(response?.data?.message || 'Không thể tải chi tiết bài đăng');
    }
  }
);

export const deletePosting = createAsyncThunk<void, number, { rejectValue: string }>(
  'jobSeekerPosting/delete',
  async (jobSeekerPostId, { rejectWithValue }) => {
    try {
      await deleteJobSeekerPost(jobSeekerPostId);
    } catch (error) {
      const response = getErrorData(error);
      return rejectWithValue(response?.data?.message || 'Xóa bài đăng thất bại');
    }
  }
);

export const fetchPostSuggestions = createAsyncThunk<Job[], number, { rejectValue: string }>(
  'jobSeekerPosting/fetchSuggestions',
  async (jobSeekerPostId, { rejectWithValue }) => {
    try {
      const response = await getJobSuggestions(jobSeekerPostId);

      if (response.success && Array.isArray(response.data)) {
        const mappedJobs: Job[] = await Promise.all(
          response.data.map(async (item: JobSuggestionData) => {
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
              title: item.title || 'Công việc gợi ý',
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
    } catch (error) {
      const response = getErrorData(error);
      return rejectWithValue(response?.data?.message || 'Không thể tải danh sách gợi ý');
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
      .addCase(createPosting.rejected, (state, action) => {
        state.create.loading = false;
        const payload = action.payload;
        if (payload && typeof payload === 'object' && 'message' in payload) {
          state.create.error = (payload as { message: string }).message;
          state.create.errorStatus = (payload as { status: number | null }).status ?? null;
        } else if (typeof payload === 'string') {
          state.create.error = payload;
          state.create.errorStatus = null;
        } else {
          state.create.error = 'Tạo bài đăng thất bại';
          state.create.errorStatus = null;
        }
      })
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
      .addCase(updatePosting.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = action.payload ?? 'Cập nhật bài đăng thất bại';
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
      .addCase(fetchPostById.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload ?? 'Không thể tải chi tiết bài đăng';
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
      .addCase(deletePosting.rejected, (state, action) => {
        state.delete.loading = false;
        state.delete.error = action.payload ?? 'Xóa bài đăng thất bại';
      })
      .addCase(fetchPostSuggestions.pending, (state) => {
        state.suggestions.loading = true;
        state.suggestions.error = null;
      })
      .addCase(fetchPostSuggestions.fulfilled, (state, action) => {
        state.suggestions.loading = false;
        state.suggestions.jobs = action.payload;
      })
      .addCase(fetchPostSuggestions.rejected, (state, action) => {
        state.suggestions.loading = false;
        state.suggestions.error = action.payload ?? 'Không thể tải danh sách gợi ý';
      });
  },
});

export const { resetPostStatus } = jobSeekerPostingSlice.actions;
export default jobSeekerPostingSlice.reducer;
