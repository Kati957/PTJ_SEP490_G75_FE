import baseService from './baseService';
import type { Rating } from '../types/profile';

interface RatingAverageResponse {
  userId: number;
  average: number | null;
}

const ratingService = {
  async getRatingsForUser(userId: number): Promise<Rating[]> {
    if (!userId) {
      return [];
    }
    return await baseService.get<Rating[]>(`/Rating/user/${userId}`);
  },

  async getAverageRatingForUser(userId: number): Promise<number> {
    if (!userId) {
      return 0;
    }
    const response = await baseService.get<RatingAverageResponse>(`/Rating/user/${userId}/average`);
    return Number(response?.average ?? 0);
  }
};

export default ratingService;
