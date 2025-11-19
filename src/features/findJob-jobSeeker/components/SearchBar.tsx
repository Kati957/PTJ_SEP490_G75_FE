import React, { useEffect, useState } from "react";
import { Card, Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import locationService, {
  type LocationOption,
} from "../../location/locationService";
import { useCategories } from "../../category/hook";
import type { JobSearchFilters } from "../types";

const SALARY_OPTIONS = [
  { value: "all", label: "Tất cả mức lương" },
  { value: "hasValue", label: "Có thông tin lương" },
  { value: "negotiable", label: "Thỏa thuận" },
];

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

  const { categories, isLoading: isLoadingCategories } = useCategories();

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
    <Card className="shadow-lg rounded-2xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400 mr-1" />}
          placeholder="Nhập tên công việc"
          value={formState.keyword}
          onChange={(e) => handleChange("keyword", e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          size="large"
        />
        <Select
          placeholder="Chọn thành phố"
          value={formState.provinceId ?? undefined}
          onChange={(value) =>
            handleChange("provinceId", normalizeNumberValue(value))
          }
          allowClear
          showSearch
          optionFilterProp="children"
          size="large"
        >
          {provinces.map((prov) => (
            <Select.Option key={prov.code} value={prov.code}>
              {prov.name}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Ngành nghề"
          value={formState.categoryId ?? undefined}
          onChange={(value) =>
            handleChange("categoryId", normalizeNumberValue(value))
          }
          allowClear
          showSearch
          optionFilterProp="children"
          size="large"
          loading={isLoadingCategories}
        >
          {categories.map((cat: any) => (
            <Select.Option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Muc luong"
          value={formState.salary}
          onChange={(value) => handleChange("salary", value)}
          size="large"
        >
          {SALARY_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" size="large" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>
    </Card>
  );
};

export default SearchBar;
