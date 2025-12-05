import type { AxiosRequestHeaders } from 'axios';
import baseService from '../../../services/baseService';
import type {
  AdminNews,
  AdminNewsDetail,
  AdminCreateNewsPayload,
  AdminUpdateNewsPayload
} from '../types/news';

const buildNewsFormData = (payload: AdminCreateNewsPayload | AdminUpdateNewsPayload) => {
  const formData = new FormData();
  formData.append('Title', payload.title);
  formData.append('Content', payload.content);
  if (payload.category !== undefined) {
    formData.append('Category', payload.category ?? '');
  }
  formData.append('IsFeatured', String(payload.isFeatured));
  formData.append('Priority', payload.priority.toString());

  if ('isPublished' in payload && payload.isPublished !== undefined) {
    formData.append('IsPublished', String(payload.isPublished));
  }

  if (payload.coverImage) {
    formData.append('CoverImage', payload.coverImage);
  }

  return formData;
};

const adminNewsService = {
  async getNews(params?: { isPublished?: boolean; keyword?: string }): Promise<AdminNews[]> {
    const searchParams = new URLSearchParams();
    if (params?.isPublished !== undefined) {
      searchParams.append('isPublished', String(params.isPublished));
    }
    if (params?.keyword) {
      searchParams.append('keyword', params.keyword.trim());
    }
    const query = searchParams.toString();
    return await baseService.get<AdminNews[]>(`/admin/news${query ? `?${query}` : ''}`);
  },

  async getNewsDetail(id: number): Promise<AdminNewsDetail> {
    return await baseService.get<AdminNewsDetail>(`/admin/news/${id}`);
  },

  async createNews(payload: AdminCreateNewsPayload): Promise<number> {
    const formData = buildNewsFormData(payload);
    const response = await baseService.post<{ id: number }>(`/admin/news`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders
    });
    return response.id;
  },

  async updateNews(id: number, payload: AdminUpdateNewsPayload): Promise<void> {
    const formData = buildNewsFormData(payload);
    await baseService.put(`/admin/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders
    });
  },

  async togglePublish(id: number): Promise<void> {
    await baseService.post(`/admin/news/${id}/toggle-publish`);
  }
};

export default adminNewsService;
