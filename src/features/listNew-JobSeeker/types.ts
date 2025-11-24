export interface NewsItem {
  newsID: number;
  title: string;
  content: string;
  imageUrl: string;
  galleryUrls: string[];
  category: string;
  isFeatured: boolean;
  priority: number;
  createdAt: string;
}

export interface NewsResponse {
  total: number;
  data: NewsItem[];
}

export interface GetNewsParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  sortBy?: string;
  desc?: boolean;
}

export interface NewsState {
  data: NewsItem[];
  total: number;
  loading: boolean;
  error: string | null;
  params: GetNewsParams;
}