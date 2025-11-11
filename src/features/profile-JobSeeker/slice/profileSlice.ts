import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from '../types';
import { getJobSeekerProfile, updateJobSeekerProfile as updateProfileService } from '../services/service';

// Định nghĩa kiểu dữ liệu cho trạng thái hồ sơ
interface ProfileState {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  error: string | null;
}

// Trạng thái khởi tạo
const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchJobSeekerProfile = createAsyncThunk<JobSeekerProfileDto>(
  'jobSeekerProfile/fetchProfile',
  async () => {
    const response = await getJobSeekerProfile();
    return response;
  }
);

export const updateJobSeekerProfile = createAsyncThunk<void, JobSeekerProfileUpdateDto>(
  'jobSeekerProfile/updateProfile',
  async (profileData: JobSeekerProfileUpdateDto, { dispatch }) => {
    await updateProfileService(profileData);
    dispatch(fetchJobSeekerProfile());
  }
);

const jobSeekerProfileSlice = createSlice({
  name: 'jobSeekerProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobSeekerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSeekerProfile.fulfilled, (state, action: PayloadAction<JobSeekerProfileDto>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchJobSeekerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải hồ sơ';
        state.profile = null;
      })
      .addCase(updateJobSeekerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobSeekerProfile.fulfilled, (state) => { 
        state.loading = false;
      })
      .addCase(updateJobSeekerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi cập nhật hồ sơ';
      });
  },
});

export default jobSeekerProfileSlice.reducer;
