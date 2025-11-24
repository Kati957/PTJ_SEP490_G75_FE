import baseService from '../../services/baseService';
import type { NewsDetailItem } from './types';

const NEWS_ENDPOINT = '/news';

export const getNewsDetail = async (id: number): Promise<NewsDetailItem> => {
  const response = await baseService.get<NewsDetailItem>(`${NEWS_ENDPOINT}/${id}`);
  return response;
};