import baseService from '../../services/baseService';
import type { LoginResponse, User, MeApiResponse } from './types';

/**
 * Gọi API đăng nhập cho người tìm việc.
 */
export const loginJobSeeker = (credentials: any): Promise<LoginResponse> => {
  const requestBody = {
    usernameOrEmail: credentials.email, 
    password: credentials.password,
    deviceInfo: 'WebApp' 
  };
  return baseService.post('/Auth/login', requestBody);
};

/**
 * Gọi API để lấy thông tin người dùng hiện tại (dựa trên token).
 */
export const me = async (): Promise<User> => {
  const response = await baseService.get<MeApiResponse>('/Auth/me');
  
  const user: User = {
    id: parseInt(response.id, 10),
    username: response.username,
    email: '',
    roles: response.roles,
    verified: response.verified.toLowerCase() === 'true',
  };

  return user;
};
