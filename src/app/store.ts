
import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import authReducer from '../features/auth/slice';
import homepageReducer from '../features/homepage-jobSeeker/homepageSlice';
import findJobReducer from '../features/findJob-jobSeeker/slice';
import jobSeekerPostingReducer from '../features/jobSeekerPosting/slice';;

const rootReducer = combineReducers({
  auth: authReducer,
  homepage: homepageReducer,
  findJob: findJobReducer,
  jobSeekerPosting: jobSeekerPostingReducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
