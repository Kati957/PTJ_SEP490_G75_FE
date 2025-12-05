import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../../app/store';
import type { JobMajor, JobLocation } from './types';
import { jobMajors, popularLocations, locationsByAlphabet } from './mockData';

interface FindJobState {
  majors: JobMajor[];
  popularLocations: JobLocation[];
  locationsByAlphabet: { [key: string]: JobLocation[] };
  loading: boolean;
  error: string | null;
}

const initialState: FindJobState = {
  majors: [],
  popularLocations: [],
  locationsByAlphabet: {},
  loading: false,
  error: null
};

const findJobSlice = createSlice({
  name: 'findJob',
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<{ majors: JobMajor[], popular: JobLocation[], byAlphabet: { [key: string]: JobLocation[] } }>) {
      state.majors = action.payload.majors;
      state.popularLocations = action.payload.popular;
      state.locationsByAlphabet = action.payload.byAlphabet;
      state.loading = false;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure
} = findJobSlice.actions;

export default findJobSlice.reducer;

export const fetchFindJobData = (): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchDataStart());
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(fetchDataSuccess({ majors: jobMajors, popular: popularLocations, byAlphabet: locationsByAlphabet }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
    dispatch(fetchDataFailure(message));
  }
};
