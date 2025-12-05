import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Cho phép override API base qua env; mặc định dùng HTTPS nội bộ.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7100/api';


const getAccessToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};


export const setAccessToken = (token: string): void => {
  sessionStorage.setItem('accessToken', token);
};

export const removeAccessToken = (): void => {
  sessionStorage.removeItem('accessToken');
};



const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


let isRefreshing = false;
type FailedQueueItem = { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void };
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const isExpiredTokenError = (error: AxiosError) => {
  const status = error.response?.status;
  const data = error.response?.data as { message?: string; Message?: string } | undefined;
  const message = data?.message || data?.Message || error.message;

  if (status === 403 && typeof message === 'string') {
    const lower = message.toLowerCase();
    return lower.includes('expired') || lower.includes('token expired');
  }
  return false;
};


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const shouldRefresh =
      (error.response?.status === 401 || isExpiredTokenError(error)) && !originalRequest._retry;

    if (shouldRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axiosInstance.post('/Auth/refresh');

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);
        
        processQueue(null);

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        removeAccessToken();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


type RequestConfig = Partial<InternalAxiosRequestConfig>;

const get = <T>(endpoint: string, config: RequestConfig = {}) => {
  return axiosInstance.get<T>(endpoint, config).then((res) => res.data);
};

const post = <T, D = unknown>(endpoint: string, data?: D, config: RequestConfig = {}) => {
  return axiosInstance.post<T>(endpoint, data, config).then((res) => res.data);
};

const put = <T, D = unknown>(endpoint: string, data?: D, config: RequestConfig = {}) => {
  return axiosInstance.put<T>(endpoint, data, config).then((res) => res.data);
};

const del = <T>(endpoint: string, config: RequestConfig = {}) => {
  return axiosInstance.delete<T>(endpoint, config).then((res) => res.data);
};

const baseService = { get, post, put, del };

export default baseService;
