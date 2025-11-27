import baseService from '../../../services/baseService';
import type { Employer, EmployerFilter, EmployerRanking } from '../types';
import type { PaginatedJobResponse, JobPostView } from '../../job/jobTypes';

const JOB_LIST_API_URL = '/EmployerPost/all';
const PUBLIC_PROFILE_API_URL = '/EmployerProfile/public';
interface EmployerPublicProfileApi {
  displayName?: string;
  avatarUrl?: string;
}

type EmployerJobPostView = JobPostView & { employerId?: number };

const extractProvince = (fullAddress: string): string => {
  if (!fullAddress) return '';
  const parts = fullAddress.split(',');
  const lastPart = parts[parts.length - 1].trim();
  return lastPart.replace(/^(Tinh|Thanh pho|TP\.?)\s+/i, '');
};

const enrichWithProfile = async (employer: Employer): Promise<Employer> => {
  try {
    const profile = await baseService.get<EmployerPublicProfileApi>(`${PUBLIC_PROFILE_API_URL}/${employer.id}`);
    return {
      ...employer,
      name: profile.displayName || employer.name,
      logo: profile.avatarUrl || employer.logo || "",
    };
  } catch (error) {
    console.warn(`Khong the tai profile cho nha tuyen dung ${employer.id}`, error);
    return { ...employer, logo: employer.logo || "" };
  }
};

export const getEmployers = async (
  filters: EmployerFilter
): Promise<{ employers: Employer[]; totalRecords: number }> => {
  try {
    const response = await baseService.get<PaginatedJobResponse>(JOB_LIST_API_URL);
    const jobData: EmployerJobPostView[] = (response.data ?? []) as EmployerJobPostView[];

    const employerMap = new Map<
      number,
      {
        base: Employer;
        locations: Set<string>;
      }
    >();

    jobData.forEach((job) => {
      const employerId = Number(job.employerId);
      if (!employerId) {
        return;
      }

      const existing = employerMap.get(employerId);
      const province = extractProvince(job.location || '');
      if (existing) {
        existing.base.jobCount += 1;
        if (province) {
          existing.locations.add(province);
        }
      } else {
        const locations = new Set<string>();
        if (province) {
          locations.add(province);
        }
        employerMap.set(employerId, {
          base: {
            id: employerId,
            name: job.employerName || `Nha tuyen dung #${employerId}`,
            logo: '',
            jobCount: 1,
            locations: [],
          },
          locations,
        });
      }
    });

    let employers = Array.from(employerMap.values()).map(({ base, locations }) => ({
      ...base,
      locations: Array.from(locations),
    }));

    const keyword = (filters.keyword ?? '').trim().toLowerCase();
    if (keyword) {
      employers = employers.filter((employer) => employer.name.toLowerCase().includes(keyword));
    }

    const totalRecords = employers.length;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;

    const startIndex = (page - 1) * pageSize;
    const paginatedEmployers = employers.slice(startIndex, startIndex + pageSize);

    const enrichedEmployers = await Promise.all(paginatedEmployers.map((employer) => enrichWithProfile(employer)));

    return {
      employers: enrichedEmployers,
      totalRecords,
    };
  } catch (error) {
    console.error('Loi khi tai danh sach nha tuyen dung:', error);
    return { employers: [], totalRecords: 0 };
  }
};

export const getTopEmployersByApply = async (top = 10): Promise<EmployerRanking[]> => {
  try {
    // baseService đã set baseURL = https://localhost:7100/api, nên không thêm /api ở đây để tránh đúp đường dẫn
    const response = await baseService.get<EmployerRanking[]>(`/employers/top`, {
      params: { top },
    });
    return response ?? [];
  } catch (error) {
    console.error('Loi khi tai top nha tuyen dung:', error);
    return [];
  }
};
