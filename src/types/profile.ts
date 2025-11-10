export interface Profile {
  profileId?: number;
  userId: number;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  location?: string;
  averageRating?: number;
  ratings?: Rating[];
}

export interface ProfileUpdateRequest {
  displayName?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  location?: string;
  imageFile?: File | null;
}

export interface Rating {
  ratingId: number;
  raterId: number;
  raterName?: string;
  ratingValue: number;
  comment?: string;
  createdAt: string;
}
