import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JobPostData } from './jobTypes';
import type { RootState } from '@reduxjs/toolkit/query';

// 1. Định nghĩa state ban đầu (form rỗng)
const initialState: JobPostData = {
  jobTitle: '',
  jobDescription: '',
  salaryValue: null,
  requirements: '',
  workHours: '',
  location: '',
  categoryID: null,
  contactPhone: '',
  salaryType: 'negotiable',
};

// 2. Tạo Slice
export const jobPostingSlice = createSlice({
  name: 'jobPosting',
  initialState,
  reducers: {
    // Action này sẽ thay thế hàm handleDataChange
    updateJobField: (state, action: PayloadAction<{ field: keyof JobPostData, value: any }>) => {
      const { field, value } = action.payload;
      // Dùng 'any' ở đây để linh hoạt, vì state là một object phức tạp
      (state as any)[field] = value;
    },
    // Action để reset form sau khi submit thành công
    resetJobForm: () => initialState,
  },
});

// 3. Export actions và reducer
export const { updateJobField, resetJobForm } = jobPostingSlice.actions;

// 4. Export selector
export const selectJobPostData = (state: RootState) => state.jobPosting;

export default jobPostingSlice.reducer;