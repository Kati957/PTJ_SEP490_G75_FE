// DTO từ backend
export interface JobSeekerProfileDto {
  profileId: number;
  userId: number;
  fullName: string | null;
  gender: string | null;
  birthYear: number | null;
  profilePicture: string | null;
  contactPhone: string | null;
  location: string | null;
  fullLocation: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
}

export interface JobSeekerProfileUpdateDto {
  fullName?: string | null;
  gender?: string | null;
  birthYear?: number | null;
  contactPhone?: string | null;
  fullLocation?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  imageFile?: File | null;
}

