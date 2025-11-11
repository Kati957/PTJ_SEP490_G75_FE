import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchJobSeekerProfile } from '../slice/profileSlice';

export const useJobSeekerProfile = () => {
  const dispatch: AppDispatch = useDispatch();
  const { profile, loading, error } = useSelector(
    (state: RootState) => state.jobSeekerProfile
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchJobSeekerProfile());
    }
  }, [dispatch, profile]);

  return {
    profile,
    loading,
    error,
  };
};
