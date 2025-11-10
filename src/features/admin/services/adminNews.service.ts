import baseService from '../../../services/baseService';
import type {
  AdminNews,
  AdminNewsDetail,
  AdminCreateNewsPayload,
  AdminUpdateNewsPayload
} from '../types/news';

const adminNewsService = {
  async getNews(params?: { status?: string; keyword?: string }): Promise<AdminNews[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      searchParams.append('status', params.status);
    }
    if (params?.keyword) {
      searchParams.append('keyword', params.keyword.trim());
    }
    const query = searchParams.toString();
    return await baseService.get<AdminNews[]>(
      `/admin/news${query ? `?${query}` : ''}`
    );
  },

  async getNewsDetail(id: number): Promise<AdminNewsDetail> {
    return await baseService.get<AdminNewsDetail>(`/admin/news/${id}`);
  },

  async createNews(payload: AdminCreateNewsPayload): Promise<number> {
    const response = await baseService.post<{ id: number }>(`/admin/news`, payload);
    return response.id;
  },

  async updateNews(id: number, payload: AdminUpdateNewsPayload): Promise<void> {
    await baseService.put(`/admin/news/${id}`, payload);
  },

  async toggleActive(id: number): Promise<void> {
    await baseService.post(`/admin/news/${id}/toggle-active`);
  }
};

export default adminNewsService;
