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
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {data.jobTitle || "Chua dat tieu de?"}
      </h2>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          Mo ta cong viec
        </h3>
        <p
          className="text-gray-600 whitespace-pre-line"
          dangerouslySetInnerHTML={{
            __html: data.jobDescription || "Chua co mo ta",
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-1">Yeu cau</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {data.requirements || "Chua co yeu cau"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Muc luong
          </h3>
          <p className="text-gray-700">
            {data.salaryText
              ? data.salaryText
              : data.salaryValue
              ? `${data.salaryValue.toLocaleString()} VND`
              : "Chua nhap"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Gio lam viec
          </h3>
          <p className="text-gray-700">{data.workHours || "Chua nhap"}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Dia diem
          </h3>
          <p className="text-gray-700">
            {data.location || data.detailAddress || "Chua nhap"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Danh muc
          </h3>
          <p className="text-gray-700">
            {isCategoriesLoading
              ? "Dang tai..."
              : categoryName
              ? categoryName
              : "Chua chon danh muc"}
          </p>
          <p className="text-sm text-gray-500">
            {data.subCategoryId
              ? isSubCategoriesLoading
                ? "Dang tai nhom nghe..."
                : subCategoryName || "Chua chon nhom nghe"
              : "Chua chon nhom nghe"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Lien he
          </h3>
          <p className="text-gray-700">
            {data.contactPhone || "Chua co so dien thoai"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
