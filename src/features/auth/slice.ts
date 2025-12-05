import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from './types';
import { me } from './services';
import { setAccessToken, removeAccessToken } from '../../services/baseService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  token: sessionStorage.getItem('accessToken'),
  isAuthenticated: false,
  status: 'idle',
};

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const user = await me();
    return user;
  } catch {
    return rejectWithValue('Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'succeeded';
      setAccessToken(action.payload.token);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.status = 'succeeded';
      removeAccessToken();
    },
    initializationComplete(state) {
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.status = 'failed';
        removeAccessToken();
      });
  },
});

export const { loginSuccess, logout, initializationComplete } = authSlice.actions;
export default authSlice.reducer;
