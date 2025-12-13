import baseService from "../../../services/baseService";

export type TimeMode = "day" | "month" | "year";

export interface AdminDashboardSummary {
  totalUsers: number;
  newUsers30Days: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalPosts: number;
  activePosts: number;
  pendingPosts: number;
  pendingReports: number;
  solvedReports: number;
  totalApplications: number;
  newApplications30Days: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growthPercent: number;
}

export interface SubscriptionStats {
  free: number;
  medium: number;
  premium: number;
  active: number;
  expired: number;
}

export interface UserTimeStat {
  date: string | null;
  year: number;
  month: number | null;
  employers: number;
  jobSeekers: number;
}

export interface PostTimeStat {
  date: string | null;
  year: number;
  month: number | null;
  employerPosts: number;
  jobSeekerPosts: number;
}

export interface RevenueTimeStat {
  date: string | null;
  year: number;
  month: number | null;
  revenue: number;
}

export interface NewsTimeStat {
  date: string | null;
  year: number;
  month: number | null;
  count: number;
}

export interface JobCategoryStat {
  categoryId: number;
  categoryName: string;
  count: number;
  [key: string]: string | number;
}

export interface TopEmployerStat {
  userId: number;
  employerName: string;
  totalPosts: number;
  totalApplications: number;
}

export interface RevenueByPlanStat {
  planName: string;
  revenue: number;
  transactions: number;
  users: number;
  successRate: number;
  [key: string]: string | number;
}

const unwrapData = <T>(payload: unknown): T | undefined => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data as T;
  }
  return payload as T;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = toNumberOrNull(value);
  return parsed ?? fallback;
};

const pick = (obj: Record<string, unknown>, candidates: string[]): unknown => {
  for (const key of candidates) {
    if (key in obj) return obj[key];
  }
  return undefined;
};

const extractTimeFields = (obj: Record<string, unknown>) => {
  const dateRaw = pick(obj, ["date", "Date", "createdAt", "CreatedAt", "paidAt", "PaidAt"]);
  const isoDate =
    typeof dateRaw === "string" || typeof dateRaw === "number" || dateRaw instanceof Date
      ? (() => {
          const dt = new Date(dateRaw);
          return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
        })()
      : null;

  const derivedYear = isoDate ? new Date(isoDate).getFullYear() : 0;
  const derivedMonth = isoDate ? new Date(isoDate).getMonth() + 1 : null;

  const year = toNumber(pick(obj, ["year", "Year"]), derivedYear);
  const monthRaw = pick(obj, ["month", "Month"]);
  const monthParsed = toNumberOrNull(monthRaw);

  return {
    date: isoDate,
    year,
    month: monthParsed ?? derivedMonth,
  };
};

const adminDashboardService = {
  async getSummary(): Promise<AdminDashboardSummary> {
    const res = await baseService.get<unknown>("/admin/dashboard/summary");
    const data = (unwrapData<Record<string, unknown>>(res) ?? {}) as Record<string, unknown>;

    return {
      totalUsers: toNumber(pick(data, ["totalUsers", "TotalUsers"])),
      newUsers30Days: toNumber(pick(data, ["newUsers30Days", "NewUsers30Days"])),
      totalEmployers: toNumber(pick(data, ["totalEmployers", "TotalEmployers"])),
      totalJobSeekers: toNumber(pick(data, ["totalJobSeekers", "TotalJobSeekers"])),
      totalPosts: toNumber(pick(data, ["totalPosts", "TotalPosts"])),
      activePosts: toNumber(pick(data, ["activePosts", "ActivePosts"])),
      pendingPosts: toNumber(pick(data, ["pendingPosts", "PendingPosts"])),
      pendingReports: toNumber(pick(data, ["pendingReports", "PendingReports"])),
      solvedReports: toNumber(pick(data, ["solvedReports", "SolvedReports"])),
      totalApplications: toNumber(pick(data, ["totalApplications", "TotalApplications"])),
      newApplications30Days: toNumber(pick(data, ["newApplications30Days", "NewApplications30Days"])),
    };
  },

  async getRevenueSummary(): Promise<RevenueSummary> {
    const res = await baseService.get<unknown>("/admin/dashboard/revenue/summary");
    const data = unwrapData<Record<string, unknown>>(res) ?? (res as Record<string, unknown> | undefined) ?? {};

    return {
      totalRevenue: toNumber(pick(data, ["totalRevenue", "TotalRevenue"])),
      thisMonthRevenue: toNumber(pick(data, ["thisMonthRevenue", "ThisMonthRevenue"])),
      lastMonthRevenue: toNumber(pick(data, ["lastMonthRevenue", "LastMonthRevenue"])),
      growthPercent: toNumber(pick(data, ["growthPercent", "GrowthPercent", "monthGrowthPercent", "MonthGrowthPercent"])),
    };
  },

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const res = await baseService.get<unknown>("/admin/dashboard/subscription-stats");
    const data = (unwrapData<Record<string, unknown>>(res) ?? {}) as Record<string, unknown>;

    return {
      free: toNumber(pick(data, ["free", "Free"])),
      medium: toNumber(pick(data, ["medium", "Medium"])),
      premium: toNumber(pick(data, ["premium", "Premium"])),
      active: toNumber(pick(data, ["active", "Active"])),
      expired: toNumber(pick(data, ["expired", "Expired"])),
    };
  },

  async getUserStats(mode: TimeMode): Promise<UserTimeStat[]> {
    const res = await baseService.get<unknown>(`/admin/dashboard/users/by-${mode}`);
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    const mapped = (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      const { date, year, month } = extractTimeFields(obj);
      const total = toNumber(pick(obj, ["total", "Total", "count", "Count"]), 0);
      const employersRaw = toNumber(pick(obj, ["employers", "Employers", "employer", "Employer", "countEmployer", "countEmployers"]), 0);
      const jobSeekersRaw = toNumber(pick(obj, ["jobSeekers", "JobSeekers", "jobSeeker", "JobSeeker", "countJobSeekers", "countJobSeeker"]), 0);
      let employers = employersRaw;
      const jobSeekers = jobSeekersRaw;
      if (employers === 0 && jobSeekers === 0 && total > 0) {
        employers = total;
      }
      return {
        date,
        year,
        month,
        employers,
        jobSeekers,
      };
    });
    return mapped;
  },

  async getPostStats(mode: TimeMode): Promise<PostTimeStat[]> {
    const res = await baseService.get<unknown>(`/admin/dashboard/posts/by-${mode}`);
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    const mapped = (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      const { date, year, month } = extractTimeFields(obj);
      const total = toNumber(pick(obj, ["total", "Total", "count", "Count"]), 0);
      const employerPosts = toNumber(pick(obj, ["employerPosts", "EmployerPosts", "employer", "Employer", "countEmployerPosts"]), 0);
      const jobSeekerPosts = toNumber(pick(obj, ["jobSeekerPosts", "JobSeekerPosts", "jobSeeker", "JobSeeker", "countJobSeekerPosts"]), 0);
      let employerPostsFinal = employerPosts;
      if (employerPostsFinal === 0 && jobSeekerPosts === 0 && total > 0) {
        employerPostsFinal = total;
      }
      return {
        date,
        year,
        month,
        employerPosts: employerPostsFinal,
        jobSeekerPosts,
      };
    });
    return mapped;
  },

  async getRevenueStats(mode: TimeMode): Promise<RevenueTimeStat[]> {
    const res = await baseService.get<unknown>(`/admin/dashboard/revenue/by-${mode}`);
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    const mapped = (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      const { date, year, month } = extractTimeFields(obj);
      return {
        date,
        year,
        month,
        revenue: toNumber(pick(obj, ["revenue", "Revenue"])),
      };
    });
    return mapped;
  },

  async getNewsStats(mode: TimeMode): Promise<NewsTimeStat[]> {
    const res = await baseService.get<unknown>(`/admin/dashboard/news/by-${mode}`);
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    return (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      const { date, year, month } = extractTimeFields(obj);
      return {
        date,
        year,
        month,
        count: toNumber(pick(obj, ["count", "Count", "total", "Total"])),
      };
    });
  },

  async getCategoryStats(): Promise<JobCategoryStat[]> {
    const res = await baseService.get<unknown>("/admin/dashboard/categories");
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    return (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        categoryId: toNumber(pick(obj, ["categoryId", "CategoryId"])),
        categoryName: String(pick(obj, ["categoryName", "CategoryName"]) ?? "Không xác định"),
        count: toNumber(pick(obj, ["count", "Count"])),
      };
    });
  },

  async getTopEmployers(): Promise<TopEmployerStat[]> {
    const res = await baseService.get<unknown>("/admin/dashboard/top-employers");
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    return (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        userId: toNumber(pick(obj, ["userId", "UserId"])),
        employerName: String(pick(obj, ["employerName", "EmployerName"]) ?? "Nha tuyen dung"),
        totalPosts: toNumber(pick(obj, ["totalPosts", "TotalPosts"])),
        totalApplications: toNumber(pick(obj, ["totalApplications", "TotalApplications"])),
      };
    });
  },

  async getRevenueByPlan(): Promise<RevenueByPlanStat[]> {
    const res = await baseService.get<unknown>("/admin/dashboard/revenue/by-plan");
    const payload = unwrapData<unknown[]>(res) ?? (Array.isArray(res) ? res : []);

    return (Array.isArray(payload) ? payload : []).map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        planName: String(pick(obj, ["planName", "PlanName"]) ?? "Plan"),
        revenue: toNumber(pick(obj, ["revenue", "Revenue"])),
        transactions: toNumber(pick(obj, ["transactions", "Transactions", "count", "Count"])),
        users: toNumber(pick(obj, ["users", "Users", "employers", "Employers"])),
        successRate: toNumber(pick(obj, ["successRate", "SuccessRate"])),
      };
    });
  },
};

export default adminDashboardService;
