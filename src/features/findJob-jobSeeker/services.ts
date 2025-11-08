import baseService from '../../services/baseService';
import type { EmployerPostDtoOut, EmployerPostDtoOutResponse } from './types';

export const getJobDetail = async (id: string): Promise<EmployerPostDtoOut> => {
  const response = await baseService.get<EmployerPostDtoOutResponse>(`/EmployerPost/${id}`);
  return response.data;
};
