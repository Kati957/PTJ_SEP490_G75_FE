import React, { useMemo } from "react";
import { useCategories } from "../../../category/hook";
import type { Category } from "../../../category/type";
import type { JobPostData } from "../../jobTypes";
import { formatSalaryRange } from "../../../../utils/salary";

interface JobPostingPreviewProps {
  data: JobPostData;
}

const JobPostingPreview: React.FC<JobPostingPreviewProps> = ({ data }) => {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const categoryName = useMemo(() => {
    if (isCategoriesLoading || !data.categoryID) return null;
    const foundCategory = categories.find(
      (cat: Category) => cat.categoryId === data.categoryID
    );
    return foundCategory ? foundCategory.name : null;
  }, [data.categoryID, categories, isCategoriesLoading]);

  const encodeImageSrc = (src: string) =>
    src && !src.startsWith("data:") ? encodeURI(src) : src;

  const previewImages = [
    ...data.existingImages.map((img) => img.url),
    ...data.imagePreviews,
  ];

  const salaryPreview = useMemo(() => {
    if (data.salaryDisplay && data.salaryDisplay.trim().length > 0) {
      return data.salaryDisplay;
    }
    return formatSalaryRange(
      data.salaryMin,
      data.salaryMax,
      data.salaryType,
      "Chưa nhập"
    );
  }, [data.salaryDisplay, data.salaryMin, data.salaryMax, data.salaryType]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-gray-500">Thông tin xem trước</p>
          <h2 className="text-2xl font-semibold text-gray-800 break-words job-posting-preview-text">
            {data.jobTitle || "Chưa đặt tiêu đề"}
          </h2>
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Hình ảnh cho bài đăng tuyển dụng
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {previewImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              >
                <img
                  src={encodeImageSrc(src)}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          Mô tả công việc
        </h3>
        <div
          className="text-gray-600 whitespace-pre-wrap break-words job-posting-preview-text"
          dangerouslySetInnerHTML={{
            __html: data.jobDescription || "Chưa có mô tả",
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">Yêu cầu</h3>
        <p className="text-gray-600 whitespace-pre-wrap break-words job-posting-preview-text">
          {data.requirements || "Chưa có yêu cầu"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>

          <h3 className="text-sm font-semibold text-gray-500 uppercase">

            Mức lương

          </h3>

          <p className="text-gray-700 break-words job-posting-preview-text">{salaryPreview}</p>

        </div>


        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Giờ làm việc
          </h3>
          <p className="text-gray-700 break-words job-posting-preview-text">
            {data.workHours || "Chưa nhập"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Địa điểm
          </h3>
          <p className="text-gray-700 break-words job-posting-preview-text">
            {data.location || data.detailAddress || "Chưa nhập"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Danh mục
          </h3>
          <p className="text-gray-700 break-words job-posting-preview-text">
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
          <p className="text-gray-700 break-words job-posting-preview-text">
            {data.contactPhone || "Chưa có số điện thoại"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Ngày hết hạn
          </h3>
          <p className="text-gray-700">
            {data.expiredAt ? data.expiredAt : "Chưa thiết lập"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
