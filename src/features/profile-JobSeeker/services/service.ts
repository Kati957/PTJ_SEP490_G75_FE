import baseService from "../../../services/baseService";
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from "../types";

const API_URL_ME = "/JobSeekerProfile/me";
const API_URL_UPDATE = "/JobSeekerProfile/update";
const API_URL_PICTURE = "/JobSeekerProfile/picture";
const API_URL_PUBLIC = "/JobSeekerProfile/public";

const normalizeProfile = (p: any): JobSeekerProfileDto => ({
  profileId: p.profileId ?? p.ProfileId ?? 0,
  userId: p.userId ?? p.UserId ?? 0,
  fullName: p.fullName ?? p.FullName ?? null,
  gender: p.gender ?? p.Gender ?? null,
  birthYear: p.birthYear ?? p.BirthYear ?? null,
  profilePicture: p.profilePicture ?? p.ProfilePicture ?? null,
  contactPhone: p.contactPhone ?? p.ContactPhone ?? null,
  location: p.location ?? p.Location ?? p.fullLocation ?? p.FullLocation ?? null,
  fullLocation: p.fullLocation ?? p.FullLocation ?? null,
  provinceId: p.provinceId ?? p.ProvinceId ?? null,
  districtId: p.districtId ?? p.DistrictId ?? null,
  wardId: p.wardId ?? p.WardId ?? null,
});

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
      }
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
