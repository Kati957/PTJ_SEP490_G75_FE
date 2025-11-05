import baseService from "../../services/baseService";
import type { Category } from "./type";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const res = await baseService.get<Category[]>("/Category");
    return res;
  },

  getById: async (id: number): Promise<Category> => {
    const res = await baseService.get<Category>(`/Category/${id}`);
    return res;
  },
};
