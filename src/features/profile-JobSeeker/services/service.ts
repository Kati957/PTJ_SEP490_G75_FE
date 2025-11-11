import baseService from '../../../services/baseService';
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from '../types';

const API_URL_ME = '/JobSeekerProfile/me';
const API_URL_UPDATE = '/JobSeekerProfile/update';

export const getJobSeekerProfile = async (): Promise<JobSeekerProfileDto> => {
  try {
    const response = await baseService.get<JobSeekerProfileDto>(API_URL_ME);
    return response;
  } catch (error) {
    console.error('Lỗi khi tải hồ sơ Job Seeker:', error);
    throw error;
  }
};


export const updateJobSeekerProfile = async (profileData: JobSeekerProfileUpdateDto): Promise<string> => {
  try {
    const formData = new FormData();

    if (profileData.fullName !== undefined) formData.append('FullName', profileData.fullName || '');
    if (profileData.gender !== undefined) formData.append('Gender', profileData.gender || '');
    if (profileData.birthYear !== undefined) formData.append('BirthYear', profileData.birthYear.toString());
    if (profileData.skills !== undefined) formData.append('Skills', profileData.skills || '');
    if (profileData.experience !== undefined) formData.append('Experience', profileData.experience || '');
    if (profileData.education !== undefined) formData.append('Education', profileData.education || '');
    if (profileData.preferredJobType !== undefined) formData.append('PreferredJobType', profileData.preferredJobType || '');
    if (profileData.preferredLocation !== undefined) formData.append('PreferredLocation', profileData.preferredLocation || '');
    if (profileData.contactPhone !== undefined) formData.append('ContactPhone', profileData.contactPhone || '');
    
    if (profileData.imageFile) {
      formData.append('ImageFile', profileData.imageFile);
    }

    const response = await baseService.put<string>(API_URL_UPDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ Job Seeker:', error);
    throw error;
  }
};
