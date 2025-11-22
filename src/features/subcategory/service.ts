import baseService from "../../services/baseService";
import type {
  SubCategory,
  SubCategoryCreateDto,
  SubCategoryUpdateDto,
  SubCategoryFilterDto,
} from "./type";

export const subCategoryService = {
  async getAll(): Promise<SubCategory[]> {
    return await baseService.get<SubCategory[]>("/SubCategory");
  },

  async getById(id: number): Promise<SubCategory> {
    return await baseService.get<SubCategory>(`/SubCategory/${id}`);
  },

  async getByCategory(categoryId: number): Promise<SubCategory[]> {
    return await baseService.get<SubCategory[]>(
      `/SubCategory/by-category/${categoryId}`
    );
  },

  async filter(payload: SubCategoryFilterDto): Promise<SubCategory[]> {
    return await baseService.post<SubCategory[]>(
      "/SubCategory/filter",
      payload
    );
  },

  async create(payload: SubCategoryCreateDto): Promise<SubCategory> {
    return await baseService.post<SubCategory>("/SubCategory", payload);
  },

  async update(
    id: number,
    payload: SubCategoryUpdateDto
  ): Promise<void> {
    await baseService.put<void>(`/SubCategory/${id}`, payload);
  },

  async remove(id: number): Promise<void> {
    await baseService.del<void>(`/SubCategory/${id}`);
  },
};
