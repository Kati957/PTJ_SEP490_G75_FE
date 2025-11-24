import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getNewsList } from './services';
import type { NewsState, GetNewsParams, NewsResponse } from './types';

const initialState: NewsState = {
  data: [],
  total: 0,
  loading: false,
  error: null,
  params: {
    page: 1,
    pageSize: 9,
    sortBy: 'CreatedAt',
    desc: true,
    keyword: '',
  },
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params: GetNewsParams, { rejectWithValue }) => {
    try {
      const response = await getNewsList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách tin tức');
    }
  }
);

const newsSlice = createSlice({
  name: 'newsList',
  initialState,
  reducers: {
    setNewsParams: (state, action: PayloadAction<Partial<GetNewsParams>>) => {
      state.params = { ...state.params, ...action.payload };
    },
    resetNewsParams: (state) => {
      state.params = initialState.params;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action: PayloadAction<NewsResponse>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchNews.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setNewsParams, resetNewsParams } = newsSlice.actions;
export default newsSlice.reducer;