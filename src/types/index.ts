export interface Job {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  updatedAt: string;
  companyLogo: string | null;
  isHot: boolean | null;
  matchPercent?: number | null;
  rawScore?: number | null;
}

export interface JobCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface Employer {
  id: string;
  name: string;
  jobsCount: number;
  location: string;
  logo: string;
  backgroundImage: string; // Thêm trường ảnh background
  jobDescription: string; // Thêm trường mô tả công việc đang tuyển
}

export interface DataHomepage {
  featuredJobs: Job[];
  jobCategories: JobCategory[];
  topEmployers: Employer[]; // Thêm trường topEmployers
}
