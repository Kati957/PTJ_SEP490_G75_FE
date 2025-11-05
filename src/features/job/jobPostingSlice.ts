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
    requirements: '',
    workHours: '',
    location: '',
    categoryID: null,
    contactPhone: '',
    salaryType: 'negotiable',
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
      if (res.success) {
        message.success(res.message || 'Đăng việc thành công!');
      } else {
        message.error(res.message || 'Đăng việc thất bại.');
      }
      return res;
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi máy chủ.');
      return rejectWithValue(err.response?.data);
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
