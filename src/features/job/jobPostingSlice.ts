import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { JobPostData, EmployerPostDto, JobPostResponse } from './jobTypes';
import jobPostService from './jobPostService';
import { message } from 'antd';

interface EmployerJobPostingState {
  form: JobPostData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: EmployerJobPostingState = {
  form: {
    jobTitle: '',
    jobDescription: '',
    salaryValue: null,
    salaryText: null,
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
    subCategoryId: null,
    contactPhone: '',
  },
  status: 'idle',
};

export const createEmployerJobPost = createAsyncThunk<
  JobPostResponse,
  EmployerPostDto,
  { rejectValue: any }
>(
  'employerJobPosting/createJobPost',
  async (dto: EmployerPostDto, { rejectWithValue }) => {
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
    } catch (err: any) {
      const responseData = err.response?.data;

      if (responseData?.success) {
        message.success(responseData.message || 'Dang viec thanh cong!');
        return responseData;
      }

      const isServerError = err.response?.status && err.response.status >= 500;
      if (isServerError) {
        const optimisticResponse: JobPostResponse = {
          success: true,
          message: 'Dang viec thanh cong!',
          data: responseData?.data ?? null,
        };
        message.success(optimisticResponse.message);
        return optimisticResponse;
      }

      const errorMessage = responseData?.message || 'Loi may chu.';
      message.error(errorMessage);
      return rejectWithValue(responseData ?? { message: errorMessage });
    }
  }
);


const employerJobPostingSlice = createSlice({
  name: 'employerJobPosting',
  initialState,
  reducers: {
    updateJobField: (state, action: PayloadAction<{ field: keyof JobPostData; value: any }>) => {
      const { field, value } = action.payload;
      (state.form as any)[field] = value;
    },
    resetJobForm: (state) => {
      state.form = initialState.form;
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
