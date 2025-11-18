export interface AdminNews {
  newsId: number;
  title: string;
  category?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string | null;
  isFeatured?: boolean;
  priority?: number;
}

export interface AdminNewsDetail extends AdminNews {
  content?: string | null;
  imageUrl?: string | null;
  adminId: number;
  adminEmail?: string | null;
  isFeatured: boolean;
  priority: number;
}

export interface AdminCreateNewsPayload {
  title: string;
  content: string;
  category?: string;
  isFeatured: boolean;
  priority: number;
  isPublished: boolean;
  coverImage?: File | null;
}

export interface AdminUpdateNewsPayload extends Omit<AdminCreateNewsPayload, 'isPublished'> {
  isPublished?: boolean;
}

export type AdminNewsStatusFilter = 'all' | 'published' | 'unpublished';
