import type { EmployerPostDto, JobPostData } from './jobTypes';

const stripHtml = (value?: string | null) =>
  (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const transformToEmployerPostDto = (data: JobPostData, userId: number): EmployerPostDto => ({
  userID: userId,
  title: data.jobTitle,
  description: stripHtml(data.jobDescription),
  salaryMin: data.salaryMin,
  salaryMax: data.salaryMax,
  salaryType: data.salaryType,
  requirements: stripHtml(data.requirements),
  workHourStart: data.workHourStart,
  workHourEnd: data.workHourEnd,
  provinceId: data.provinceId,
  districtId: data.districtId,
  wardId: data.wardId,
  detailAddress: data.detailAddress,
  categoryID: data.categoryID,
  phoneContact: data.contactPhone,
  expiredAt: data.expiredAt,
  images: data.images,
  deleteImageIds: data.deleteImageIds,
});
