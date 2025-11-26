import { Card, Typography, Select, Radio } from "antd";
import { useCategories } from "../../category/hook";
import { useSubCategories } from "../../subcategory/hook";
import type { JobSearchFilters } from "../types";

const { Title, Text } = Typography;

const salaryOptions: { value: JobSearchFilters["salaryRange"]; label: string }[] = [
  { value: "all", label: "Tất cả?" },
  { value: "under1", label: "Dưới 1 triệu" },
  { value: "1-3", label: "1 - 3 triệu" },
  { value: "3-5", label: "3 - 5 triệu" },
  { value: "5plus", label: "Từ 5 triệu trở lên" },
  { value: "negotiable", label: "Thỏa thuận" },
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
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories(
    filters.categoryId ?? null
  );

  const handleCategoryChange = (categoryId: number | null) => {
    const selectedCat = categories.find(
      (item: any) => item.categoryId === categoryId
    );
    onChange({
      categoryId,
      categoryName: selectedCat ? (selectedCat as any).name : null,
      subCategoryId: null,
      subCategoryName: null,
    });
  };

  const handleSubCategoryChange = (subCategoryId: number | null) => {
    const selectedSub = subCategories.find(
      (item: any) => item.subCategoryId === subCategoryId
    );
    onChange({
      subCategoryId,
      subCategoryName: selectedSub ? (selectedSub as any).name : null,
    });
  };

  return (
    <Card
      className="shadow-md rounded-2xl sticky top-4 overflow-hidden"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Title level={5} className="!mb-0 text-gray-800">
          Bộ lọc
        </Title>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
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
              {categories.map((cat: any) => (
                <Select.Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Chọn nhóm nghề?"
              value={filters.subCategoryId ?? undefined}
              onChange={(value) =>
                handleSubCategoryChange(
                  value === undefined ? null : (value as number)
                )
              }
              allowClear
              showSearch
              optionFilterProp="children"
              loading={isLoadingSubCategories}
              className="w-full"
              size="large"
              disabled={!filters.categoryId}
            >
              {subCategories.map((sub: any) => (
                <Select.Option
                  key={sub.subCategoryId}
                  value={sub.subCategoryId}
                >
                  {sub.name}
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
