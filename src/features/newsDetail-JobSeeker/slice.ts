import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getNewsDetail } from './services';
import type { NewsDetailState, NewsDetailItem } from './types';

const initialState: NewsDetailState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchNewsDetail = createAsyncThunk(
  'newsDetail/fetchDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getNewsDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chi tiết tin tức');
    }
  }
);

const newsDetailSlice = createSlice({
  name: 'newsDetail',
  initialState,
  reducers: {
    resetNewsDetail: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsDetail.fulfilled, (state, action: PayloadAction<NewsDetailItem>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchNewsDetail.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetNewsDetail } = newsDetailSlice.actions;
export default newsDetailSlice.reducer;