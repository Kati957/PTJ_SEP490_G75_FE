import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Profile, ProfileUpdateRequest } from '../../../types/profile';
import profileService from '../services/profile.service';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null
};

export const fetchEmployerProfile = createAsyncThunk<Profile>(
  'profile/fetchEmployerProfile',
  async () => await profileService.getEmployerProfile()
);

export const updateEmployerProfile = createAsyncThunk<Profile, ProfileUpdateRequest>(
  'profile/updateEmployerProfile',
  async (data) => await profileService.updateEmployerProfile(data)
);

export const deleteEmployerAvatar = createAsyncThunk<Profile>(
  'profile/deleteEmployerAvatar',
  async () => await profileService.deleteEmployerAvatar()
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      .addCase(deleteEmployerAvatar.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(deleteEmployerAvatar.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete avatar';
      });
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
