import React, { useMemo } from "react";
import { useCategories } from "../../../category/hook";
import type { Category } from "../../../category/type";
import { useSubCategories } from "../../../subcategory/hook";
import type { SubCategory } from "../../../subcategory/type";

interface JobPostingPreviewProps {
  data: {
    jobTitle: string;
    jobDescription: string;
    salaryValue: number | null;
    salaryText: string | null;
    requirements: string;
    workHours: string;
    detailAddress: string;
    location: string;
    categoryID: number | null;
    subCategoryId: number | null;
    contactPhone: string;
  };
}

const JobPostingPreview: React.FC<JobPostingPreviewProps> = ({ data }) => {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { subCategories, isLoading: isSubCategoriesLoading } = useSubCategories(
    data.categoryID ?? null
  );

  const categoryName = useMemo(() => {
    if (isCategoriesLoading || !data.categoryID) {
      return null;
    }
    const foundCategory = categories.find(
      (cat: Category) => cat.categoryId === data.categoryID
    );
    return foundCategory ? foundCategory.name : null;
  }, [data.categoryID, categories, isCategoriesLoading]);

  const subCategoryName = useMemo(() => {
    if (!data.subCategoryId || isSubCategoriesLoading) {
      return null;
    }
    const found = subCategories.find(
      (item: SubCategory) => item.subCategoryId === data.subCategoryId
    );
    return found ? found.name : null;
  }, [data.subCategoryId, subCategories, isSubCategoriesLoading]);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {data.jobTitle || "Chưa đặt tiêu đề"}
      </h2>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          Mô tả công việc
        </h3>
        <p
          className="text-gray-700 whitespace-pre-line font-medium"
          dangerouslySetInnerHTML={{
            __html: data.jobDescription || "Chưa có mô tả",
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">Yêu cầu công việc</h3>
        <p className="text-gray-700 whitespace-pre-line font-medium">
          {data.requirements || "Chưa có yêu cầu"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Mức lương (VND)
          </h3>
          <p className="text-gray-800 font-semibold">
            {data.salaryText
              ? data.salaryText
              : data.salaryValue
              ? `${data.salaryValue.toLocaleString()} VND`
              : "Chưa nhập mức lương"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Giờ làm việc
          </h3>
          <p className="text-gray-800 font-semibold">{data.workHours || "Chưa nhập giờ làm việc"}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Địa điểm
          </h3>
          <p className="text-gray-800 font-semibold">
            {data.location || data.detailAddress || "Chưa nhập địa điểm"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Ngành nghề
          </h3>
          <p className="text-gray-800 font-semibold">
            {isCategoriesLoading
              ? "Đang tải..."
              : categoryName
              ? categoryName
              : "Chưa chọn ngành nghề"}
          </p>
          <p className="text-sm text-gray-600">
            {data.subCategoryId
              ? isSubCategoriesLoading
                ? "Đang tải nhóm nghề..."
                : subCategoryName || "Chưa chọn nhóm nghề"
              : "Chưa chọn nhóm nghề"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Số điện thoại liên hệ
          </h3>
          <p className="text-gray-800 font-semibold">
            {data.contactPhone || "Chưa có số điện thoại liên hệ"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
