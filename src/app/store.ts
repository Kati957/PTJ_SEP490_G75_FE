import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import authReducer from '../features/auth/slice';
import homepageReducer from '../features/homepage-jobSeeker/homepageSlice';
import findJobReducer from '../features/findJob-jobSeeker/slice';
import jobSeekerPostingReducer from '../features/jobSeekerPosting/slice';
import savedJobsReducer from '../features/savedJob-jobSeeker/slice';
import jobDetailReducer from '../features/findJob-jobSeeker/jobDetailSlice';
import employerJobPostingReducer from '../features/job/jobPostingSlice';
import categoryReducer from '../features/category/slice';
import subCategoryReducer from '../features/subcategory/slice';
import adminJobsReducer from '../features/admin-js-post/slice';
import appliedJobsReducer from '../features/applyJob-jobSeeker/slices/appliedJobsSlice';
import profileReducer from '../features/employer/slice/profileSlice';
import employersReducer from '../features/listEmployer-jobSeeker/slice/employerSlice';
import jobSeekerProfileReducer from '../features/profile-JobSeeker/slice/profileSlice';
import adminEmployerReducer from '../features/admin-employer-post/slice';
import jobSeekerPostListReducer from '../features/jobseekerList-jobSeeker/slice';
import employerDetailReducer from '../features/employerDetail-jobseeker/slice';
import newsListreducer from '../features/listNew-JobSeeker/slice';
import newsDetailReducer from '../features/newsDetail-JobSeeker/slice';
import notificationReducer from '../features/notification/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  homepage: homepageReducer,
  findJob: findJobReducer,
  jobSeekerPosting: jobSeekerPostingReducer,
  savedJobs: savedJobsReducer,
  jobDetail: jobDetailReducer,
  employerPosting: employerJobPostingReducer, 
  category: categoryReducer,
  subcategory: subCategoryReducer,
  appliedJobs: appliedJobsReducer,
  adminJobs: adminJobsReducer,
  profile: profileReducer,
  employers: employersReducer,
  jobSeekerProfile: jobSeekerProfileReducer,
  adminEmployer: adminEmployerReducer,
  jobSeekerPostList: jobSeekerPostListReducer,
  employerDetail: employerDetailReducer,//redux của employer chi tiết khi click vào thẻ card employer ở jobseeker
  newsList: newsListreducer,
  newsDetail: newsDetailReducer,
  notification: notificationReducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
