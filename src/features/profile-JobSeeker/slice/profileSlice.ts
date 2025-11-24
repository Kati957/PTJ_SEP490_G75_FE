import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from '../types';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile as updateProfileService,
  deleteJobSeekerProfilePicture as deleteProfilePictureService,
} from '../services/service';

interface ProfileState {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchJobSeekerProfile = createAsyncThunk<JobSeekerProfileDto>(
  'jobSeekerProfile/fetchProfile',
  async () => {
    return await getJobSeekerProfile();
  }
);

export const updateJobSeekerProfile = createAsyncThunk<void, JobSeekerProfileUpdateDto>(
  'jobSeekerProfile/updateProfile',
  async (profileData: JobSeekerProfileUpdateDto, { dispatch }) => {
    await updateProfileService(profileData);
    dispatch(fetchJobSeekerProfile());
  }
);

export const deleteJobSeekerProfilePicture = createAsyncThunk<void>(
  'jobSeekerProfile/deletePicture',
  async (_, { dispatch }) => {
    await deleteProfilePictureService();
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
        state.error = action.error.message || 'Loi khi tai ho so';
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
        state.error = action.error.message || 'Loi khi cap nhat ho so';
      })
      .addCase(deleteJobSeekerProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobSeekerProfilePicture.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteJobSeekerProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Loi khi xoa anh ho so';
      });
  },
});

export default jobSeekerProfileSlice.reducer;
