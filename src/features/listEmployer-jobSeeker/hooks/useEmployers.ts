import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchEmployers, setEmployerFilters } from '../slice/employerSlice';
import type { EmployerFilter } from '../types';

export const useEmployers = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allEmployers, loading, error, filters } = useSelector(
    (state: RootState) => state.employers
  );

  const applyFilters = (newFilters: EmployerFilter) => {
    dispatch(setEmployerFilters(newFilters));
  };

  useEffect(() => {
    dispatch(fetchEmployers(filters));
  }, [dispatch, filters]);

  return {
    employers: allEmployers,
    loading,
    error,
    filters,
    applyFilters,
  };
};
