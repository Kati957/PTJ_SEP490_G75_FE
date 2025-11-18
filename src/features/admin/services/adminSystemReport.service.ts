import baseService from '../../../services/baseService';
import { adaptPagedResult, type PagedResult, type RawPagedResponse } from './pagedResultHelper';
import type {
  AdminResolveSystemReportPayload,
  AdminSystemReport,
  AdminSystemReportDetail,
  AdminSystemReportFilters
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

const adminSystemReportService = {
  async getSystemReports(
    filters: AdminSystemReportFilters = {}
  ): Promise<PagedResult<AdminSystemReport>> {
    const query = buildQuery({
      status: filters.status,
      keyword: filters.keyword,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    });
    const response = await baseService.get<RawPagedResponse<AdminSystemReport>>(
      `/admin/system-reports${query}`
    );
    return adaptPagedResult(response);
  },

  async getSystemReportDetail(id: number): Promise<AdminSystemReportDetail> {
    return await baseService.get<AdminSystemReportDetail>(`/admin/system-reports/${id}`);
  },

  async resolveSystemReport(reportId: number, payload: AdminResolveSystemReportPayload) {
    return await baseService.post(`/admin/system-reports/${reportId}/resolve`, payload);
  }
};

export default adminSystemReportService;
