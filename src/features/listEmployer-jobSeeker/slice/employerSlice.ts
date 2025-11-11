import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Employer, EmployerFilter } from '../types';
import { getEmployers } from '../services/service';

interface EmployerState {
  allEmployers: Employer[];
  loading: boolean;
  error: string | null;
  filters: EmployerFilter;
}

const initialState: EmployerState = {
  allEmployers: [],
  loading: false,
  error: null,
  filters: {},
};

export const fetchEmployers = createAsyncThunk<Employer[], EmployerFilter>(
  'employers/fetchEmployers',
  async (filters) => {
    const response = await getEmployers(filters);
    return response;
  }
);

const employerSlice = createSlice({
  name: 'employers',
  initialState,
  reducers: {
    setEmployerFilters(state, action: PayloadAction<EmployerFilter>) {
        state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployers.fulfilled, (state, action: PayloadAction<Employer[]>) => {
        state.loading = false;
        state.allEmployers = action.payload;
      })
      .addCase(fetchEmployers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải danh sách nhà tuyển dụng';
        state.allEmployers = [];
      });
  },
});

export const { setEmployerFilters } = employerSlice.actions;
export default employerSlice.reducer;
