export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  verified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
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