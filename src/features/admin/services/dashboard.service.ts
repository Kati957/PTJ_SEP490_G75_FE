import baseService from '../../../services/baseService';

export interface AdminDashboardOverview {
  totalAccounts: number;
  totalPosts: number;
  pendingReports: number;
}

export interface ManagementSummaryResponse {
  total: number;
  pending?: number;
  active?: number;
  inactive?: number;
}

const adminDashboardService = {
  async getOverview(): Promise<AdminDashboardOverview> {
    // Ưu tiên endpoint overview; nếu chưa có, trả về fallback phía trên
    const response = await baseService
      .get<AdminDashboardOverview>('/admin/overview')
      .catch(() => undefined);
    return response ?? { totalAccounts: 0, totalPosts: 0, pendingReports: 0 };
  },

  async getManagementSummary(endpoint: string): Promise<ManagementSummaryResponse> {
    return await baseService.get<ManagementSummaryResponse>(endpoint);
  }
};

export default adminDashboardService;
