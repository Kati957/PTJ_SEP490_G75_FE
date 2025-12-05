import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getNewsList } from './services';
import type { GetNewsParams, NewsResponse, NewsState } from './types';

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

export const fetchNews = createAsyncThunk<NewsResponse, GetNewsParams, { rejectValue: string }>(
  'news/fetchNews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getNewsList(params);
      return response;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Không thể tải danh sách tin tức';
      return rejectWithValue(message);
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
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Không thể tải danh sách tin tức';
      });
  },
});

export const { setNewsParams, resetNewsParams } = newsSlice.actions;
export default newsSlice.reducer;
