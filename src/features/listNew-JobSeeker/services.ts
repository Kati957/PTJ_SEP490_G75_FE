
import baseService from '../../services/baseService';
import type { GetNewsParams, NewsResponse } from './types';

const NEWS_ENDPOINT = '/news';


export const getNewsList = async (params: GetNewsParams): Promise<NewsResponse> => {
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    sortBy: params.sortBy || 'CreatedAt',
    desc: params.desc !== undefined ? params.desc : true,
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.category && { category: params.category }),
  };

  const response = await baseService.get<NewsResponse>(NEWS_ENDPOINT, {
    params: queryParams,
  });

  return response;
};