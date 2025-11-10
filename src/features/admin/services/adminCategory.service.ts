import baseService from '../../../services/baseService';
import type {
  AdminCategory,
  AdminCategoryDetail,
  AdminCategoryFilters,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload
} from '../types/category';

const buildQuery = (filters: AdminCategoryFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }
  if (typeof filters.isActive === 'boolean') {
    params.append('isActive', filters.isActive.toString());
  }
  if (filters.keyword) {
    params.append('keyword', filters.keyword.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : '';
};

const adminCategoryService = {
  async getCategories(filters: AdminCategoryFilters = {}): Promise<AdminCategory[]> {
    return await baseService.get<AdminCategory[]>(
      `/admin/categories${buildQuery(filters)}`
    );
  },

  async getCategory(id: number): Promise<AdminCategoryDetail> {
    return await baseService.get<AdminCategoryDetail>(`/admin/categories/${id}`);
  },

  async createCategory(payload: AdminCreateCategoryPayload): Promise<number> {
    const response = await baseService.post<{ id: number }>(`/admin/categories`, payload);
    return response.id;
  },

  async updateCategory(id: number, payload: AdminUpdateCategoryPayload): Promise<void> {
    await baseService.put(`/admin/categories/${id}`, payload);
  },

  async toggleActive(id: number): Promise<void> {
    await baseService.post(`/admin/categories/${id}/toggle-active`);
  }
};

export default adminCategoryService;
