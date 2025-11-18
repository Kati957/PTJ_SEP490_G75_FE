import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Profile, ProfileUpdateRequest } from '../../../types/profile';
import profileService from '../services/profile.service';
import ratingService from '../../../services/ratingService';

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

const enrichProfileWithRatings = async (profile: Profile): Promise<Profile> => {
  if (!profile?.userId) {
    return profile;
  }

  try {
    const [ratings, averageRating] = await Promise.all([
      ratingService.getRatingsForUser(profile.userId),
      ratingService.getAverageRatingForUser(profile.userId)
    ]);

    return {
      ...profile,
      ratings,
      averageRating
    };
  } catch (error) {
    console.error('Failed to load rating information', error);
    return profile;
  }
};

export const fetchEmployerProfile = createAsyncThunk<Profile>(
  'profile/fetchEmployerProfile',
  async () => {
    const profile = await profileService.getEmployerProfile();
    return await enrichProfileWithRatings(profile);
  }
);

export const updateEmployerProfile = createAsyncThunk<Profile, ProfileUpdateRequest>(
  'profile/updateEmployerProfile',
  async (data) => {
    const updatedProfile = await profileService.updateEmployerProfile(data);
    return await enrichProfileWithRatings(updatedProfile);
  }
);

export const deleteEmployerAvatar = createAsyncThunk<Profile>(
  'profile/deleteEmployerAvatar',
  async () => {
    const profile = await profileService.deleteEmployerAvatar();
    return await enrichProfileWithRatings(profile);
  }
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
