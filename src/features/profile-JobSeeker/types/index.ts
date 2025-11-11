// DTO từ backend
export interface JobSeekerProfileDto {
    profileId: number;
    userId: number;
    fullName: string | null;
    gender: string | null;
    birthYear: number | null;
    profilePicture: string | null;
    skills: string | null;
    experience: string | null;
    education: string | null;
    preferredJobType: string | null;
    preferredLocation: string | null;
    contactPhone: string | null;
}

export interface JobSeekerProfileUpdateDto {
    fullName?: string | null;
    gender?: string | null;
    birthYear?: number | null;
    skills?: string | null;
    experience?: string | null;
    education?: string | null;
    preferredJobType?: string | null;
    preferredLocation?: string | null;
    contactPhone?: string | null;
    imageFile?: File | null;
}

