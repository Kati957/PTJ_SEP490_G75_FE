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
    return await baseService.get<AdminDashboardOverview>('/AdminDashboard/overview');
  },

  async getManagementSummary(endpoint: string): Promise<ManagementSummaryResponse> {
    return await baseService.get<ManagementSummaryResponse>(endpoint);
  }
};

export default adminDashboardService;
