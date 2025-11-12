import React, { useMemo } from "react";
import { useCategories } from "../../../category/hook";
import type { Category } from "../../../category/type";

interface JobPostingPreviewProps {
  data: {
    jobTitle: string;
    jobDescription: string;
    salaryValue: number | null;
    requirements: string;
    workHours: string;
    location: string;
    categoryID: number | null;
    contactPhone: string;
  };
}
const JobPostingPreview: React.FC<JobPostingPreviewProps> = ({ data }) => {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const categoryName = useMemo(() => {
    if (isCategoriesLoading || !data.categoryID) {
      return null;
    }
    const foundCategory = categories.find(
      (cat: Category) => cat.categoryId === data.categoryID
    );
    return foundCategory ? foundCategory.name : null;
  }, [data.categoryID, categories, isCategoriesLoading]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {data.jobTitle || "Chưa đặt tiêu đề"}
      </h2>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          Mô tả công việc
        </h3>
        <p
          className="text-gray-600 whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: data.jobDescription || "Chưa có mô tả",
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">Yêu cầu</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {data.requirements || "Chưa có yêu cầu"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Mức lương
          </h3>
          <p className="text-gray-700">
              {data.salaryValue.toLocaleString() || "Chưa nhập"} VNĐ
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Giờ làm việc
          </h3>
          <p className="text-gray-700">{data.workHours || "Chưa nhập"}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Địa điểm
          </h3>
          <p className="text-gray-700">{data.location || "Chưa nhập"}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Danh mục
          </h3>
          <p className="text-gray-700">
            {isCategoriesLoading
              ? "Đang tải..."
              : categoryName
              ? categoryName
              : "Chưa chọn danh mục"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Liên hệ
          </h3>
          <p className="text-gray-700">
            {data.contactPhone || "Chưa có số điện thoại"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
