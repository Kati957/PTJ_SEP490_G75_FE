import baseService from '../../../services/baseService';
import type { Employer, EmployerFilter, EmployerRanking } from '../types';
import type { PaginatedJobResponse, JobPostView } from '../../job/jobTypes';

const JOB_LIST_API_URL = '/EmployerPost/all';
const PUBLIC_PROFILE_API_URL = '/EmployerProfile';

interface EmployerPublicProfileApi {
  userId?: number;
  displayName?: string;
  avatarUrl?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  address?: string;
  email?: string;
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
      logo: profile.avatarUrl || employer.logo || '',
      address: profile.location || profile.address || employer.address,
      email: profile.contactEmail || profile.email || employer.email,
      description: profile.description || employer.description || '',
    };
  } catch (error) {
    console.warn(`Không thể tải profile cho nhà tuyển dụng ${employer.id}`, error);
    return { ...employer, logo: employer.logo || '' };
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
      categories: Set<string>;
    }
  >();

    jobData.forEach((job) => {
      const employerId = Number(job.employerId);
      if (!employerId) {
        return;
      }

      const existing = employerMap.get(employerId);
      const province = extractProvince(job.location || '');
      const categoryName = job.categoryName || '';
      if (existing) {
        existing.base.jobCount += 1;
        if (province) {
          existing.locations.add(province);
        }
        if (categoryName) {
          existing.categories.add(categoryName);
        }
      } else {
        const locations = new Set<string>();
        const categories = new Set<string>();
        if (province) {
          locations.add(province);
        }
        if (categoryName) {
          categories.add(categoryName);
        }
        employerMap.set(employerId, {
          base: {
            id: employerId,
            name: job.employerName || `Nha tuyen dung #${employerId}`,
            logo: '',
            jobCount: 1,
            locations: [],
            categories: [],
            description: '',
          },
          locations,
          categories,
        });
      }
    });

    let employers = Array.from(employerMap.values()).map(({ base, locations, categories }) => ({
      ...base,
      locations: Array.from(locations),
      categories: Array.from(categories),
    }));

    const normalizeText = (value?: string | null): string =>
      (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const keyword = normalizeText(filters.keyword);
    if (keyword) {
      employers = employers.filter((employer) => {
        const nameMatch = normalizeText(employer.name).includes(keyword);
        const locationMatch = employer.locations?.some((loc) => normalizeText(loc).includes(keyword));
        return nameMatch || locationMatch;
      });
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
    const response = await baseService.get<EmployerRanking[]>(`/employers/top`, {
      params: { top },
    });
    return response ?? [];
  } catch (error) {
    console.error('Loi khi tai top nha tuyen dung:', error);
    return [];
  }
};

export const getEmployerPublicProfile = async (userId: number | string): Promise<EmployerPublicProfileApi> => {
  return baseService.get<EmployerPublicProfileApi>(`${PUBLIC_PROFILE_API_URL}/${userId}`);
};
