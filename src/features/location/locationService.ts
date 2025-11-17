import baseService from "../../services/baseService";

export interface LocationOption {
  code: number;
  name: string;
}

export const getProvinces = async (): Promise<LocationOption[]> => {
  return await baseService.get<LocationOption[]>("/location/provinces");
};

export const getDistricts = async (
  provinceId: number
): Promise<LocationOption[]> => {
  if (!provinceId) return [];
  return await baseService.get<LocationOption[]>(
    `/location/districts/${provinceId}`
  );
};

export const getWards = async (
  districtId: number
): Promise<LocationOption[]> => {
  if (!districtId) return [];
  return await baseService.get<LocationOption[]>(
    `/location/wards/${districtId}`
  );
};

export const locationService = {
  getProvinces,
  getDistricts,
  getWards,
};

export default locationService;
