import { Card, Typography, Select, Radio } from "antd";
import { useCategories } from "../../category/hook";
import type { Category } from "../../category/type";
import type { JobSearchFilters } from "../types";
import { salaryTypeOptions } from "../../../utils/salary";

const { Title, Text } = Typography;

const salaryOptions: { value: JobSearchFilters["salaryRange"]; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "under1", label: "Dưới 1 triệu" },
  { value: "1-3", label: "1 - 3 triệu" },
  { value: "3-5", label: "3 - 5 triệu" },
  { value: "5plus", label: "Từ 5 triệu trở lên" },
  { value: "negotiable", label: "Thỏa thuận" },
];

const salaryTypeFilterOptions: {
  value: JobSearchFilters["salaryType"];
  label: string;
}[] = [
  { value: "all", label: "Tất cả" },
  ...salaryTypeOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
  })),
];

interface JobFiltersProps {
  filters: JobSearchFilters;
  onChange: (partial: Partial<JobSearchFilters>) => void;
  onClear: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const { categories, isLoading: isLoadingCategories } = useCategories();

  const handleCategoryChange = (categoryId: number | null) => {
    const selectedCat = categories.find(
      (item: Category) => item.categoryId === categoryId
    );
    onChange({
      categoryId,
      categoryName: selectedCat ? selectedCat.name : null,
    });
  };

  return (
    <Card
      className="shadow-md rounded-2xl sticky top-4 overflow-hidden border border-blue-50"
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <Title level={5} className="!mb-0 text-gray-800">
          Bộ lọc
        </Title>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
        >
         Xóa tất cả
        </button>
      </div>

      <div className="divide-y">
        <div className="px-4 py-4">
          <Text strong className="block text-gray-800">
            Mức lương (VND)
          </Text>
          <Radio.Group
            className="mt-3 grid gap-2 text-gray-700"
            value={filters.salaryRange ?? "all"}
            onChange={(e) =>
              onChange({
                salaryRange: e.target.value,
                salary: e.target.value === "negotiable" ? "negotiable" : "all",
              })
            }
          >
            {salaryOptions.map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <div className="px-4 py-4">
          <Text strong className="block text-gray-800">
            Loại lương
          </Text>
          <Radio.Group
            className="mt-3 grid gap-2 text-gray-700"
            value={filters.salaryType ?? "all"}
            onChange={(e) =>
              onChange({
                salaryType: e.target.value,
              })
            }
          >
            {salaryTypeFilterOptions.map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <div className="px-4 py-4">
          <Text strong className="block text-gray-800 mb-3">
            Chọn nghề
          </Text>
          <div className="space-y-3">
            <Select
              placeholder="Chọn ngành"
              value={filters.categoryId ?? undefined}
              onChange={(value) =>
                handleCategoryChange(
                  value === undefined ? null : (value as number)
                )
              }
              allowClear
              showSearch
              optionFilterProp="children"
              loading={isLoadingCategories}
              className="w-full"
              size="large"
            >
              {categories.map((cat: Category) => (
                <Select.Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobFilters;
