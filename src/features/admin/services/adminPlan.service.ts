import baseService from '../../../services/baseService';
import type { AdminPlan, AdminSubscriptionHistory, AdminTransactionHistory, AdminPlanPayload } from '../types/adminPlan';

type ApiResponse<T> = { success?: boolean; data?: T };

const unwrap = <T>(res: ApiResponse<T> | T | undefined): T | undefined => {
  if (!res) return undefined;
  if (typeof res === 'object' && 'data' in (res as ApiResponse<T>)) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
};

const adminPlanService = {
  async getPlans(): Promise<AdminPlan[]> {
    const res = await baseService.get<ApiResponse<AdminPlan[]> | AdminPlan[]>('/AdminPlans/admin/plans');
    return unwrap(res) ?? [];
  },

  async getPlan(id: number): Promise<AdminPlan | null> {
    const res = await baseService.get<ApiResponse<AdminPlan> | AdminPlan>(`/AdminPlans/admin/plans/${id}`);
    return unwrap(res) ?? null;
  },

  async createPlan(payload: AdminPlanPayload): Promise<AdminPlan> {
    const res = await baseService.post<ApiResponse<AdminPlan> | AdminPlan>('/AdminPlans/admin/plans', payload);
    const data = unwrap(res);
    if (!data) throw new Error('Không thể tạo gói');
    return data;
  },

  async updatePlan(id: number, payload: AdminPlanPayload): Promise<AdminPlan> {
    const res = await baseService.put<ApiResponse<AdminPlan> | AdminPlan>(`/AdminPlans/admin/plans/${id}`, payload);
    const data = unwrap(res);
    if (!data) throw new Error('Không thể cập nhật gói');
    return data;
  },

  async deletePlan(id: number): Promise<void> {
    await baseService.del(`/AdminPlans/admin/plans/${id}`);
  },

  async getTransactionsByUser(userId: number): Promise<AdminTransactionHistory[]> {
    const res = await baseService.get<ApiResponse<AdminTransactionHistory[]> | AdminTransactionHistory[]>(
      `/AdminPlans/admin/transactions/${userId}`
    );
    return unwrap(res) ?? [];
  },

  async getSubscriptionsByUser(userId: number): Promise<AdminSubscriptionHistory[]> {
    const res = await baseService.get<ApiResponse<AdminSubscriptionHistory[]> | AdminSubscriptionHistory[]>(
      `/AdminPlans/admin/subscriptions/${userId}`
    );
    return unwrap(res) ?? [];
  },
};

export default adminPlanService;
