import { getJobDetail } from '../features/findJob-jobSeeker/services';
import type { EmployerPostDtoOut } from '../features/findJob-jobSeeker/types';

const jobDetailCache = new Map<string, EmployerPostDtoOut>();

export const DEFAULT_COMPANY_LOGO = '/src/assets/no-logo.png';

export const getJobDetailCached = async (
  jobId: string
): Promise<EmployerPostDtoOut | null> => {
  if (!jobId) {
    return null;
  }

  if (jobDetailCache.has(jobId)) {
    return jobDetailCache.get(jobId)!;
  }

  try {
    const detail = await getJobDetail(jobId);
    jobDetailCache.set(jobId, detail);
    return detail;
  } catch (error) {
    console.error(`Failed to fetch job detail for post ${jobId}`, error);
    return null;
  }
};

export const getCompanyLogoSrc = (logo?: string | null): string => {
  return logo && logo.trim().length > 0 ? logo : DEFAULT_COMPANY_LOGO;
};

export const formatSalaryText = (salary?: number | null): string => {
  if (typeof salary !== 'number' || Number.isNaN(salary) || salary <= 0) {
    return 'Thỏa thuận';
  }
  return `${salary.toLocaleString('vi-VN')} VND`;
};
