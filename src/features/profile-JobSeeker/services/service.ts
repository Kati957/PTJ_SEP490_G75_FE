import type { AxiosRequestHeaders } from "axios";
import baseService from "../../../services/baseService";
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from "../types";

const API_URL_ME = "/JobSeekerProfile/me";
const API_URL_UPDATE = "/JobSeekerProfile/update";
const API_URL_PICTURE = "/JobSeekerProfile/picture";
const API_URL_PUBLIC = "/JobSeekerProfile/public";

const pickValue = <T>(source: Record<string, unknown>, keys: string[], fallback: T): T => {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return fallback;
};

const normalizeProfile = (p: unknown): JobSeekerProfileDto => {
  const source = (p ?? {}) as Record<string, unknown>;
  return {
    profileId: pickValue<number>(source, ['profileId', 'ProfileId'], 0),
    userId: pickValue<number>(source, ['userId', 'UserId'], 0),
  fullName: pickValue<string | null>(source, ['fullName', 'FullName'], null),
  gender: pickValue<string | null>(source, ['gender', 'Gender'], null),
  birthYear: pickValue<number | null>(source, ['birthYear', 'BirthYear'], null),
  profilePicture: pickValue<string | null>(source, ['profilePicture', 'ProfilePicture'], null),
  contactPhone: pickValue<string | null>(source, ['contactPhone', 'ContactPhone'], null),
  location: pickValue<string | null>(source, ['location', 'Location', 'fullLocation', 'FullLocation'], null),
  fullLocation: pickValue<string | null>(source, ['fullLocation', 'FullLocation'], null),
  provinceId: pickValue<number | null>(source, ['provinceId', 'ProvinceId'], null),
  districtId: pickValue<number | null>(source, ['districtId', 'DistrictId'], null),
  wardId: pickValue<number | null>(source, ['wardId', 'WardId'], null),
  };
};

export const getJobSeekerProfile = async (): Promise<JobSeekerProfileDto> => {
  try {
    const res = await baseService.get<JobSeekerProfileDto>(API_URL_ME);
    return normalizeProfile(res);
  } catch (error) {
    console.error("Loi khi tai ho so Job Seeker:", error);
    throw error;
  }
};

export const getPublicJobSeekerProfile = async (
  userId: number
): Promise<JobSeekerProfileDto> => {
  try {
    const res = await baseService.get<JobSeekerProfileDto>(`${API_URL_PUBLIC}/${userId}`);
    return normalizeProfile(res);
  } catch (error) {
    console.error("Loi khi tai ho so Job Seeker public:", error);
    throw error;
  }
};

const appendIfDefined = (formData: FormData, key: string, value?: string | number | null) => {
  if (value === undefined || value === null) {
    return;
  }
  formData.append(key, String(value));
};

export const updateJobSeekerProfile = async (
  profileData: JobSeekerProfileUpdateDto
): Promise<string> => {
  try {
    const formData = new FormData();

    appendIfDefined(formData, 'FullName', profileData.fullName);
    appendIfDefined(formData, 'Gender', profileData.gender);
    appendIfDefined(formData, 'BirthYear', profileData.birthYear);
    appendIfDefined(formData, 'ContactPhone', profileData.contactPhone);
    appendIfDefined(formData, 'FullLocation', profileData.fullLocation);
    appendIfDefined(formData, 'ProvinceId', profileData.provinceId);
    appendIfDefined(formData, 'DistrictId', profileData.districtId);
    appendIfDefined(formData, 'WardId', profileData.wardId);

    if (profileData.imageFile) {
      formData.append('ImageFile', profileData.imageFile);
    }

    return await baseService.put<string>(API_URL_UPDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      } as AxiosRequestHeaders
    });
  } catch (error) {
    console.error("Loi khi cap nhat ho so Job Seeker:", error);
    throw error;
  }
};

export const deleteJobSeekerProfilePicture = async (): Promise<string> => {
  try {
    return await baseService.del<string>(API_URL_PICTURE);
  } catch (error) {
    console.error("Loi khi xoa anh ho so Job Seeker:", error);
    throw error;
  }
};
