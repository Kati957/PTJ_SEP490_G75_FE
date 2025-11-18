export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  verified: boolean;
  avatar?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  user: User;
  role?: string | null;
  warning?: string | null;
}

export interface RegisterJobSeekerPayload {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Kiểu dữ liệu trả về từ API /Auth/me.
 */
export interface MeApiResponse {
  id: string;
  username: string;
  verified: string;
  roles: string[];
}

export interface GooglePrepareNeedRoleResponse {
  needRoleSelection: true;
  email: string;
  name?: string;
  picture?: string;
  availableRoles: string[];
}

export interface GoogleCompletePayload {
  idToken: string;
  role: string;
}

export type GooglePrepareResponse = LoginResponse | GooglePrepareNeedRoleResponse;
