import React from "react";
import { Select } from "antd";
import type { JobSearchFilters, SalaryFilter } from "../types";
import { useCategories } from "../../category/hook";
import { useSubCategories } from "../../subcategory/hook";

const salaryOptions: { value: SalaryFilter; label: string }[] = [
  { value: "all", label: "Tat ca" },
  { value: "0-10", label: "Duoi 10 trieu" },
  { value: "10-15", label: "10-15 trieu" },
  { value: "15-20", label: "15-20 trieu" },
  { value: "20-25", label: "20-25 trieu" },
  { value: "25+", label: "Tren 25 trieu" },
  { value: "negotiable", label: "Thoa thuan" },
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

interface FilterSidebarProps {
  filters: JobSearchFilters;
  onChange: (changes: Partial<JobSearchFilters>) => void;
  onReset: () => void;
}

const FilterRadio: React.FC<{
  label: string;
  checked: boolean;
  onSelect: () => void;
}> = ({ label, checked, onSelect }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
    <input
      type="radio"
      checked={checked}
      onChange={onSelect}
      className="text-emerald-500 focus:ring-emerald-400"
    />
    <span>{label}</span>
  </label>
);

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories(
    filters.categoryId ?? null
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 lg:sticky lg:top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bo loc</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-emerald-600 text-sm hover:text-emerald-700"
        >
          Xoa tat ca
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Muc luong (VND)
          </p>
          <div className="space-y-2">
            {salaryOptions.map((option) => (
              <FilterRadio
                key={option.value}
                label={option.label}
                checked={filters.salary === option.value}
                onSelect={() => onChange({ salary: option.value })}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-3">
          <p className="text-sm font-semibold text-gray-800">Nganh nghe</p>
          <Select
            placeholder="Chon nganh"
            value={filters.categoryId ?? undefined}
            onChange={(value) =>
              onChange({ categoryId: normalizeNumberValue(value), subCategoryId: null })
            }
            allowClear
            showSearch
            optionFilterProp="children"
            className="w-full"
            loading={isLoadingCategories}
          >
            {categories.map((cat: any) => (
              <Select.Option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Chon nhom nghe"
            value={filters.subCategoryId ?? undefined}
            onChange={(value) =>
              onChange({ subCategoryId: normalizeNumberValue(value) })
            }
            allowClear
            showSearch
            optionFilterProp="children"
            className="w-full"
            loading={isLoadingSubCategories}
            disabled={!filters.categoryId}
          >
            {subCategories.map((sub: any) => (
              <Select.Option key={sub.subCategoryId} value={sub.subCategoryId}>
                {sub.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
