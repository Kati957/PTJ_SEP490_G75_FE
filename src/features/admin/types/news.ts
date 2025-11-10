export interface AdminNews {
  newsId: number;
  title: string;
  category?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminNewsDetail extends AdminNews {
  content?: string | null;
  imageUrl?: string | null;
  adminId: number;
  adminEmail?: string | null;
}

export interface AdminCreateNewsPayload {
  title: string;
  content?: string;
  imageUrl?: string;
  category?: string;
}

export interface AdminUpdateNewsPayload extends AdminCreateNewsPayload {
  status?: string;
}

export type AdminNewsStatusFilter = 'all' | 'Active' | 'Hidden';
