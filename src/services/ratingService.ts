import baseService from "./baseService";
import type { Rating } from "../types/profile";

interface RatingAverageResponse {
  userId: number;
  average: number | null;
}

const ratingService = {
  async getRatingsForUser(userId: number): Promise<Rating[]> {
    if (!userId) {
      return [];
    }
    return baseService.get<Rating[]>(`/Rating/user/${userId}`);
  },

  async getAverageRatingForUser(userId: number): Promise<number> {
    if (!userId) {
      return 0;
    }
    const response = await baseService.get<RatingAverageResponse>(
      `/Rating/user/${userId}/average`
    );
    return Number(response?.average ?? 0);
  },

  async createRating(data: {
    rateeId: number;
    submissionId: number;
    ratingValue: number;
    comment: string;
  }): Promise<void> {
    await baseService.post("/Rating", data);
  },
};

export default ratingService;
