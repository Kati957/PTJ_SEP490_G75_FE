import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchNewsDetail, resetNewsDetail } from './slice';

export const useNewsDetail = (id: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const detailState = useSelector((state: RootState) => (state as any).newsDetail);

  const { data, loading, error } = detailState || { data: null, loading: false, error: null };

  useEffect(() => {
    if (id) {
      dispatch(fetchNewsDetail(id));
    }
    return () => {
      dispatch(resetNewsDetail());
    };
  }, [dispatch, id]);

  return {
    newsDetail: data,
    loading,
    error,
  };
};