import React from "react";
import { Input, Select, Space } from "antd";
import type { JobPostData } from "../../../../pages/employer/PostJobPage";

const { Option } = Select;

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

// Helper
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    {" "}
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">{children}</div>
  </div>
);

export const JobDetailsFormSection: React.FC<Props> = ({
  data,
  onDataChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">
        Chi tiết công việc
      </h3>

      <FormField label="Trình độ học vấn" required>
        <Select
          size="large"
          value={data.educationLevel}
          onChange={(v) => onDataChange("educationLevel", v)}
        >
          <Option value="Cử nhân">Cử nhân</Option>
          <Option value="Cao đẳng">Cao đẳng</Option>
        </Select>
      </FormField>

      <FormField label="Mức kinh nghiệm" required>
        <Select
          size="large"
          value={data.experienceLevel}
          onChange={(v) => onDataChange("experienceLevel", v)}
        >
          <Option value="1 - 2 năm kinh nghiệm">1 - 2 năm kinh nghiệm</Option>
          <Option value="Chưa có kinh nghiệm">Chưa có kinh nghiệm</Option>
        </Select>
      </FormField>

      <FormField label="Cấp bậc" required>
        <Select
          size="large"
          value={data.jobLevel}
          onChange={(v) => onDataChange("jobLevel", v)}
        >
          <Option value="Mới đi làm">Mới đi làm</Option>
          <Option value="Nhân viên">Nhân viên</Option>
        </Select>
      </FormField>

      <FormField label="Loại công việc" required>
        <Select
          size="large"
          value={data.jobType}
          onChange={(v) => onDataChange("jobType", v)}
        >
          <Option value="Nhân viên bán thời gian">
            Nhân viên bán thời gian
          </Option>
          <Option value="Toàn thời gian">Toàn thời gian</Option>
        </Select>
      </FormField>

      <FormField label="Giới tính" required>
        <Select
          size="large"
          value={data.gender}
          onChange={(v) => onDataChange("gender", v)}
        >
          <Option value="Bất kỳ">Bất kỳ</Option>
          <Option value="Nam">Nam</Option>
          <Option value="Nữ">Nữ</Option>
        </Select>
      </FormField>

      <FormField label="Mã việc làm">
        <Input
          size="large"
          value={data.jobCode}
          onChange={(e) => onDataChange("jobCode", e.target.value)}
        />
      </FormField>

      <FormField label="Ngành nghề" required>
        <Select
          size="large"
          value={data.industry}
          onChange={(v) => onDataChange("industry", v)}
        >
          <Option value="Bán lẻ / Bán sỉ">Bán lẻ / Bán sỉ</Option>
          <Option value="IT - Phần mềm">IT - Phần mềm</Option>
        </Select>
      </FormField>

      <FormField label="Từ khoá">
        <Select
          mode="tags"
          size="large"
          placeholder="Nhập từ khoá"
          value={data.keywords}
          onChange={(v) => onDataChange("keywords", v)}
        />
      </FormField>

      <FormField label="Tuổi" required>
        <Space.Compact className="w-full">
          <Select size="large" defaultValue="Trên" className="w-1/3">
            <Option value="Trên">Trên</Option>
            <Option value="Dưới">Dưới</Option>
            <Option value="Trong khoảng">Trong khoảng</Option>
          </Select>
          <Input size="large" placeholder="18" className="w-2/3" />
        </Space.Compact>
      </FormField>
    </div>
  );
};
