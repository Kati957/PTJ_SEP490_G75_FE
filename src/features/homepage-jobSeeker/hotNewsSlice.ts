import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NewsItem } from "../listNew-JobSeeker/types";
import homepageJobSeekerService from "./services";

interface HotNewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
}

const initialState: HotNewsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchHotNews = createAsyncThunk<NewsItem[], void, { rejectValue: string }>(
  "hotNews/fetchHotNews",
  async (_, { rejectWithValue }) => {
    try {
      const items = await homepageJobSeekerService.getHotNews();
      return items;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (error instanceof Error ? error.message : "KhA'ng th ¯Ÿ t §œi danh sA­ch tin n ¯i b §-t");
      return rejectWithValue(message);
    }
  }
);

const hotNewsSlice = createSlice({
  name: "hotNews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHotNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "KhA'ng th ¯Ÿ t §œi tin n ¯i b §-t";
      });
  },
});

export default hotNewsSlice.reducer;
