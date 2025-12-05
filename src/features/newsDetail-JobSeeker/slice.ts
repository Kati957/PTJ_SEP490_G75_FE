import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getNewsDetail } from './services';
import type { NewsDetailItem, NewsDetailState } from './types';

const initialState: NewsDetailState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchNewsDetail = createAsyncThunk<NewsDetailItem, number, { rejectValue: string }>(
  'newsDetail/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getNewsDetail(id);
      return response;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Không thể tải chi tiết tin tức';
      return rejectWithValue(message);
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
      .addCase(fetchNewsDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Không thể tải chi tiết tin tức';
      });
  },
});

export const { resetNewsDetail } = newsDetailSlice.actions;
export default newsDetailSlice.reducer;
