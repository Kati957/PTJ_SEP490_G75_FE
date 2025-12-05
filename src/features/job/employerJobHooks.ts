import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  updateJobField,
  resetJobForm,
  createEmployerJobPost,
  selectEmployerJobPostData,
  selectEmployerJobPostStatus,
} from './jobPostingSlice';
import type { JobPostData, EmployerPostDto } from './jobTypes';

export const useEmployerJobPosting = () => {
  const dispatch = useAppDispatch();
  
  // 2. Dùng useAppSelector
  const jobData = useAppSelector(selectEmployerJobPostData);
  const status = useAppSelector(selectEmployerJobPostStatus);

  const handleDataChange = useCallback(
    (field: keyof JobPostData, value: JobPostData[keyof JobPostData]) => {
      dispatch(updateJobField({ field, value }));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(resetJobForm());
  }, [dispatch]);

  const submitPost = useCallback((dto: EmployerPostDto) => {
    dispatch(createEmployerJobPost(dto));
  }, [dispatch]);

  return { 
    jobData,
    status,
    handleDataChange,
    resetForm: reset,
    submitPost,
  };
};
