import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subCategoryService } from "./service";
import type { SubCategory, SubCategoryState } from "./type";
import type { RootState } from "../../app/store";

const initialState: SubCategoryState = {
  all: [],
  status: "idle",
  error: null,
  byCategory: {},
  statusByCategory: {},
};

export const fetchSubCategories = createAsyncThunk(
  "subcategory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await subCategoryService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.message ?? "Failed to load sub categories");
    }
  }
);

export const fetchSubCategoriesByCategory = createAsyncThunk<
  { categoryId: number; items: SubCategory[] },
  number
>("subcategory/fetchByCategory", async (categoryId, { rejectWithValue }) => {
  try {
    const items = await subCategoryService.getByCategory(categoryId);
    return { categoryId, items };
  } catch (error: any) {
    return rejectWithValue(error.message ?? "Failed to load sub categories");
  }
});

const subCategorySlice = createSlice({
  name: "subcategory",
  initialState,
  reducers: {
    resetSubCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.all = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load";
      })
      .addCase(fetchSubCategoriesByCategory.pending, (state, action) => {
        const categoryId = action.meta.arg;
        state.statusByCategory[categoryId] = "loading";
      })
      .addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
        const { categoryId, items } = action.payload;
        state.statusByCategory[categoryId] = "succeeded";
        state.byCategory[categoryId] = items;
      })
      .addCase(fetchSubCategoriesByCategory.rejected, (state, action) => {
        const categoryId = action.meta.arg;
        state.statusByCategory[categoryId] = "failed";
        state.error = (action.payload as string) ?? "Failed to load";
      });
  },
});

export const { resetSubCategoryState } = subCategorySlice.actions;

export const selectSubCategoryState = (state: RootState) => state.subcategory;
export const selectSubCategories = (state: RootState) =>
  selectSubCategoryState(state).all;
export const selectSubCategoriesByCategory =
  (categoryId?: number | null) => (state: RootState) => {
    if (categoryId == null) {
      return selectSubCategories(state);
    }
    return selectSubCategoryState(state).byCategory[categoryId] ?? [];
  };

export default subCategorySlice.reducer;
