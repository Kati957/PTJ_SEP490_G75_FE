import baseService from '../../../services/baseService';
import { adaptPagedResult, type PagedResult, type RawPagedResponse } from './pagedResultHelper';
import type {
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

  async resolveSystemReport(reportId: number) {
    // Đã chọn MarkSolved hay Ignore, back-end hiện chỉ nhận trạng thái; đều coi như đã xử lý.
    const status = 'Solved';
    return await baseService.put(`/admin/system-reports/${reportId}`, { status });
  }
};

export default adminSystemReportService;
