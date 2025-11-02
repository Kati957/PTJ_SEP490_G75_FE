export interface JobCategory {
  id: string;
  name: string;
  count: number;
}

export interface JobMajor {
  id: string;
  name: string;
  categories: JobCategory[];
}

export interface JobLocation {
  id: string;
  name: string;
  count: number;
}

