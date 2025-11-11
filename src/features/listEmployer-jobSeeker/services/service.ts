import baseService from '../../../services/baseService';
import type { Employer, EmployerFilter, UserApiResponse } from '../types';

const API_URL = 'https://localhost:7100/api/admin/users';

const getPlaceholderLogo = (username: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
}

export const getEmployers = async (filters: EmployerFilter): Promise<Employer[]> => {
  try {
    const params = {
        role: 'employer',
        isActive: true,
        isVerified: true,
        keyword: filters.keyword || ''
    };
    const response = await baseService.get<UserApiResponse[]>(API_URL, { params });
    
    const employers: Employer[] = response.map(user => ({
        id: user.id,
        name: user.username,
        logo: getPlaceholderLogo(user.username)
    }));

    return employers;
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhà tuyển dụng:', error);
    return [];
  }
};

