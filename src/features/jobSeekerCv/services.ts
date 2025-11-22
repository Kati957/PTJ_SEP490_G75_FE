import baseService from "../../services/baseService";
import type { JobSeekerCv, JobSeekerCvPayload } from "./types";

interface CvListResponse {
  success: boolean;
  total: number;
  data: JobSeekerCv[];
}

interface CvDetailResponse {
  success: boolean;
  data: JobSeekerCv;
}

interface CvCreateResponse {
  success: boolean;
  message: string;
  data: JobSeekerCv;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export const fetchMyCvs = async (): Promise<JobSeekerCv[]> => {
  const res = await baseService.get<CvListResponse>("/JobSeekerCv");
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

export const fetchCvDetail = async (id: number): Promise<JobSeekerCv> => {
  const res = await baseService.get<CvDetailResponse>(`/JobSeekerCv/${id}`);
  return res.data;
};

export const fetchCvForEmployer = async (cvId: number): Promise<JobSeekerCv> => {
  const res = await baseService.get<CvDetailResponse>(`/employer/cv/${cvId}`);
  return res.data;
};

export const createCv = async (payload: JobSeekerCvPayload): Promise<JobSeekerCv> => {
  const res = await baseService.post<CvCreateResponse>("/JobSeekerCv", payload);
  return res.data;
};

export const updateCv = async (id: number, payload: JobSeekerCvPayload): Promise<void> => {
  await baseService.put<ApiResponse>(`/JobSeekerCv/${id}`, payload);
};

export const deleteCv = async (id: number): Promise<void> => {
  await baseService.del<ApiResponse>(`/JobSeekerCv/${id}`);
};

const jobSeekerCvService = {
  fetchMyCvs,
  fetchCvDetail,
  fetchCvForEmployer,
  createCv,
  updateCv,
  deleteCv,
};

export default jobSeekerCvService;
