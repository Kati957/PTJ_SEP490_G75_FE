import baseService from '../../../services/baseService';
import type { Profile, ProfileUpdateRequest } from '../../../types/profile';

const buildFormData = (payload: ProfileUpdateRequest) => {
  const formData = new FormData();
  if (payload.displayName !== undefined) {
    formData.append('DisplayName', payload.displayName ?? '');
  }
  if (payload.description !== undefined) {
    formData.append('Description', payload.description ?? '');
  }
  if (payload.contactName !== undefined) {
    formData.append('ContactName', payload.contactName ?? '');
  }
  if (payload.contactPhone !== undefined) {
    formData.append('ContactPhone', payload.contactPhone ?? '');
  }
  if (payload.contactEmail !== undefined) {
    formData.append('ContactEmail', payload.contactEmail ?? '');
  }
  if (payload.location !== undefined) {
    formData.append('Location', payload.location ?? '');
  }
  if (payload.website !== undefined) {
    formData.append('Website', payload.website ?? '');
  }
  if (payload.imageFile) {
    formData.append('ImageFile', payload.imageFile);
  }

  return formData;
};

const profileService = {
  async getEmployerProfile(): Promise<Profile> {
    return await baseService.get<Profile>('/EmployerProfile/me');
  },

  async getAllEmployerProfiles(): Promise<Profile[]> {
    return await baseService.get<Profile[]>('/EmployerProfile/all');
  },

  async getEmployerProfileByUserId(userId: number): Promise<Profile> {
    return await baseService.get<Profile>(`/EmployerProfile/${userId}`);
  },

  async updateEmployerProfile(payload: ProfileUpdateRequest): Promise<Profile> {
    const formData = buildFormData(payload);
    await baseService.put('/EmployerProfile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return await profileService.getEmployerProfile();
  },

  async deleteEmployerAvatar(): Promise<Profile> {
    await baseService.del('/EmployerProfile/avatar');
    return await profileService.getEmployerProfile();
  }
};

export default profileService;
