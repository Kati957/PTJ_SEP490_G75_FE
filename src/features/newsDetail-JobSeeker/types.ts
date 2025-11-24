export interface NewsDetailItem {
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

export interface NewsDetailState {
  data: NewsDetailItem | null;
  loading: boolean;
  error: string | null;
}