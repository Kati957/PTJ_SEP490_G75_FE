import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "./service";
import type { CategoryState } from "./type";
import type { RootState } from "../../app/store";

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  status: 'idle',
};

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAll();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "category/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await categoryService.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default categorySlice.reducer;

export const selectCategoryList = (state: RootState) => state.category.categories;
export const selectCategoryStatus = (state: RootState) => state.category.status;
