import React, { useEffect, useState } from "react";
import { Card, Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import locationService, {
  type LocationOption,
} from "../../location/locationService";
import type { JobSearchFilters } from "../types";

const normalizeNumberValue = (
  value: number | string | null | undefined
): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

interface SearchBarProps {
  value: JobSearchFilters;
  onSearch: (filters: JobSearchFilters) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const [formState, setFormState] = useState<JobSearchFilters>(value);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        setProvinces([]);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    setFormState(value);
  }, [value]);

  const handleChange = <T extends keyof JobSearchFilters>(
    field: T,
    newValue: JobSearchFilters[T]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleSearch = () => {
    onSearch(formState);
  };

  return (
    <Card className="shadow-xl rounded-2xl p-4 md:p-5 border-none">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            prefix={<SearchOutlined className="text-gray-400 mr-2" />}
            placeholder="Nhap vi tri, cong viec, ky nang..."
            value={formState.keyword}
            onChange={(e) => handleChange("keyword", e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            size="large"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="w-full md:w-60">
          <Select
            placeholder="Tat ca tinh thanh"
            value={formState.provinceId ?? undefined}
            onChange={(value) =>
              handleChange("provinceId", normalizeNumberValue(value))
            }
            allowClear
            showSearch
            optionFilterProp="children"
            size="large"
            className="w-full h-12 rounded-xl"
          >
            {provinces.map((prov) => (
              <Select.Option key={prov.code} value={prov.code}>
                {prov.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button
          type="primary"
          size="large"
          className="h-12 px-8 bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 rounded-xl"
          onClick={handleSearch}
        >
          Tim kiem
        </Button>
      </div>
    </Card>
  );
};

export default SearchBar;
