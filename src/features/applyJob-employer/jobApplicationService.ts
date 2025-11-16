import baseService from "../../services/baseService";
import type { AppliedJobsResponse } from "../applyJob-jobSeeker/type";

const API_URL = "/JobApplication";  


  export const jobApplicationService = {
  getApplicationsByPost: async (employerPostId: number): Promise<AppliedJobsResponse> => {
    return await baseService.get<AppliedJobsResponse>(
      `${API_URL}/by-post/${employerPostId}`
    );
  },
};
