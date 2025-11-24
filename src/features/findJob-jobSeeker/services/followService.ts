import baseService from "../../../services/baseService";

export interface EmployerFollowItem {
  employerID: number;
  employerName: string;
  followDate: string;
}

const followService = {
  follow: (jobSeekerId: number, employerId: number) =>
    baseService.post<{ message?: string }>(`/Follow/${employerId}`, null, { params: { jobSeekerId } }),

  unfollow: (jobSeekerId: number, employerId: number) =>
    baseService.del<{ message?: string }>(`/Follow/${employerId}`, { params: { jobSeekerId } }),

  check: (jobSeekerId: number, employerId: number) =>
    baseService.get<boolean | { isFollowing: boolean }>(`/Follow/check/${employerId}`, {
      params: { jobSeekerId }
    }),

  list: (jobSeekerId: number) => baseService.get<EmployerFollowItem[]>(`/Follow/list`, { params: { jobSeekerId } }),
};

export default followService;
