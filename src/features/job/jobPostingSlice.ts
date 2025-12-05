import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import type { RootState } from '../../app/store';
import jobPostService from './jobPostService';
import type { EmployerPostDto, JobPostData, JobPostResponse } from './jobTypes';

interface EmployerJobPostingState {
  form: JobPostData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

type JobPostReject = { message: string; data?: JobPostResponse['data']; success?: boolean };

const initialState: EmployerJobPostingState = {
  form: {
    jobTitle: '',
    jobDescription: '',
    salaryMin: null,
    salaryMax: null,
    salaryType: null,
    salaryDisplay: null,
    requirements: '',
    workHours: '',
    workHourStart: null,
    workHourEnd: null,
    detailAddress: '',
    provinceId: null,
    districtId: null,
    wardId: null,
    location: '',
    categoryID: null,
    contactPhone: '',
    images: [],
    imagePreviews: [],
    existingImages: [],
    deleteImageIds: [],
    expiredAt: null,
  },
  status: 'idle',
};

export const createEmployerJobPost = createAsyncThunk<JobPostResponse, EmployerPostDto, { rejectValue: JobPostReject }>(
  'employerJobPosting/createJobPost',
  async (dto, { rejectWithValue }) => {
    try {
      const res = await jobPostService.createJobPost(dto);

      if (res && typeof res.success === 'boolean') {
        if (res.success) {
          message.success(res.message || 'Đăng việc thành công!');
          return res;
        }

        const errorMessage = res.message || 'Đăng việc thất bại.';
        message.error(errorMessage);
        return rejectWithValue({ ...res, message: errorMessage });
      }

      const fallbackResponse: JobPostResponse = {
        success: true,
        message: res?.message || 'Đăng việc thành công!',
        data: res?.data ?? null,
      };
      message.success(fallbackResponse.message);
      return fallbackResponse;
    } catch (err) {
      const response = (err as { response?: { data?: JobPostResponse; status?: number } }).response;
      const responseData = response?.data;
      const statusCode = response?.status;

      if (responseData?.success) {
        message.success(responseData.message || 'Đăng việc thành công!');
        return responseData;
      }

      if (typeof statusCode === 'number' && statusCode >= 500) {
        const optimisticResponse: JobPostResponse = {
          success: true,
          message: 'Đăng việc thành công!',
          data: responseData?.data ?? null,
        };
        message.success(optimisticResponse.message);
        return optimisticResponse;
      }

      const errorMessage = responseData?.message || 'Lỗi máy chủ.';
      message.error(errorMessage);
      return rejectWithValue(responseData ?? { message: errorMessage });
    }
  }
);

const employerJobPostingSlice = createSlice({
  name: 'employerJobPosting',
  initialState,
  reducers: {
    updateJobField: (
      state,
      action: PayloadAction<{ field: keyof JobPostData; value: JobPostData[keyof JobPostData] }>
    ) => {
      const { field, value } = action.payload;
      state.form = {
        ...state.form,
        [field]: value,
      };
    },
    resetJobForm: (state) => {
      state.form = { ...initialState.form, images: [], imagePreviews: [] };
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEmployerJobPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEmployerJobPost.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createEmployerJobPost.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { updateJobField, resetJobForm } = employerJobPostingSlice.actions;

export const selectEmployerJobPostData = (state: RootState) => state.employerPosting.form;
export const selectEmployerJobPostStatus = (state: RootState) => state.employerPosting.status;

export default employerJobPostingSlice.reducer;
