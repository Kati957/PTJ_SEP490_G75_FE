import { combineReducers } from '@reduxjs/toolkit';
import createPostReducer from './slice';
import managePostsReducer from './managePostSlice';

/**
 * Gộp các reducer của feature jobSeekerPosting lại thành một reducer duy nhất.
 */
const jobSeekerPostingReducer = combineReducers({
  create: createPostReducer,
  manage: managePostsReducer,
});

export default jobSeekerPostingReducer;
