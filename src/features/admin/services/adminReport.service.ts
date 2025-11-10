import baseService from '../../../services/baseService';
import { adaptPagedResult, type RawPagedResponse, type PagedResult } from './pagedResultHelper';
import type {
  AdminReport,
  AdminSolvedReport,
  AdminReportDetail,
  AdminResolveReportPayload,
  AdminPendingReportFilters,
  AdminSolvedReportFilters
} from '../types/report';

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const adminReportService = {
  async getPendingReports(filters: AdminPendingReportFilters = {}): Promise<PagedResult<AdminReport>> {
    const query = buildQuery({
      reportType: filters.reportType,
      keyword: filters.keyword,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    });
    const response = await baseService.get<RawPagedResponse<AdminReport>>(`/admin/reports/pending${query}`);
    return adaptPagedResult(response);
  },

  async getSolvedReports(filters: AdminSolvedReportFilters = {}): Promise<PagedResult<AdminSolvedReport>> {
    const query = buildQuery({
      adminEmail: filters.adminEmail,
      reportType: filters.reportType,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    });
    const response = await baseService.get<RawPagedResponse<AdminSolvedReport>>(
      `/admin/reports/solved${query}`
    );
    return adaptPagedResult(response);
  },

  async getReportDetail(id: number): Promise<AdminReportDetail> {
    return await baseService.get<AdminReportDetail>(`/admin/reports/${id}`);
  },

  async resolveReport(reportId: number, payload: AdminResolveReportPayload) {
    return await baseService.post(`/admin/reports/resolve/${reportId}`, payload);
  }
};

export default adminReportService;
