import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchNews, setNewsParams } from './slice';
import type { GetNewsParams } from './types';

export const useNewsList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, total, loading, error, params } = useSelector(
    (state: RootState) => state.newsList
  );

  useEffect(() => {
    dispatch(fetchNews(params));
  }, [dispatch, params]);

  const updateParams = (newParams: Partial<GetNewsParams>) => {
    if (newParams.keyword !== undefined || newParams.category !== undefined) {
      dispatch(setNewsParams({ ...newParams, page: 1 }));
    } else {
      dispatch(setNewsParams(newParams));
    }
  };

  return {
    newsList: data,
    total,
    loading,
    error,
    params,
    updateParams,
  };
};