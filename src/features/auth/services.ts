import baseService from '../../services/baseService';
import type {
  LoginResponse,
  User,
  MeApiResponse,
  GooglePrepareResponse,
  GoogleCompletePayload,
  RegisterJobSeekerPayload,
  RegisterEmployerPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  RequestChangePasswordPayload,
  ConfirmChangePasswordPayload,
} from './types';

type LoginPayload = { email: string; password: string };

/**
 * Gọi API đăng nhập chung cho tất cả vai trò.
 */
export const login = (credentials: LoginPayload): Promise<LoginResponse> => {
  const requestBody = {
    usernameOrEmail: credentials.email,
    password: credentials.password,
    deviceInfo: 'WebApp',
  };
  return baseService.post('/Auth/login', requestBody);
};

export const registerJobSeeker = (payload: RegisterJobSeekerPayload) => {
  return baseService.post('/Auth/register/jobseeker', payload);
};

export const registerEmployer = (payload: RegisterEmployerPayload) => {
  return baseService.post('/Auth/register/employer', payload);
};

export const verifyEmail = (token: string) => {
  return baseService.post('/Auth/verify-email', { token });
};

export const requestPasswordReset = (payload: ForgotPasswordPayload) => {
  return baseService.post('/Auth/forgot-password', payload);
};

export const resetPassword = (payload: ResetPasswordPayload) => {
  return baseService.post('/Auth/reset-password', payload);
};

export const changePassword = (payload: ChangePasswordPayload) => {
  return baseService.post('/User/change-password', payload);
};

export const requestChangePassword = (payload: RequestChangePasswordPayload) => {
  return baseService.post('/change-password/request', payload);
};

export const confirmChangePassword = (payload: ConfirmChangePasswordPayload) => {
  return baseService.post('/change-password/confirm', payload);
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

export const googlePrepare = (idToken: string): Promise<GooglePrepareResponse> => {
  return baseService.post('/Auth/google/prepare', { idToken });
};

export const googleComplete = (payload: GoogleCompletePayload): Promise<LoginResponse> => {
  return baseService.post('/Auth/google/complete', payload);
};
