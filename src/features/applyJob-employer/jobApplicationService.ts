import baseService from "../../services/baseService";
import type { AppliedJobsResponse } from "../applyJob-jobSeeker/type";
import type {
  ApplicationActionResponse,
  JobApplicationUpdateDto,
} from "../job/jobTypes";

const API_URL = "/JobApplication";

export const jobApplicationService = {
  getApplicationsByPost: async (
    employerPostId: number
  ): Promise<AppliedJobsResponse> => {
    return await baseService.get<AppliedJobsResponse>(
      `${API_URL}/by-post/${employerPostId}`
    );
  },
  updateStatus: async (
    id: number,
    status: "Accepted" | "Rejected",
    note: string = ""
  ): Promise<ApplicationActionResponse> => {
    const payload: JobApplicationUpdateDto = { status, note };
    return await baseService.put<ApplicationActionResponse>(
      `/JobApplication/${id}/status`,
      payload
    );
  },
};
