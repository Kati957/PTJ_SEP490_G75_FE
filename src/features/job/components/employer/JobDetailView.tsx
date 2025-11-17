import React from "react";
import type { JobPostView } from "../../jobTypes";

const DetailField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <p className="text-base text-gray-900 mt-1">{children || "N/A"}</p>
  </div>
);

const formatCurrency = (value: number | null) => {
  if (!value) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")} VNĐ`;
};

export const JobDetailView: React.FC<{ job: JobPostView }> = ({ job }) => {
  return (
    <div className="p-6 border-r border-gray-200 bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-6">
        Chi tiết công việc
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <DetailField label="Tên công việc">{job.title}</DetailField>
        <DetailField label="Ngành nghề">{job.categoryName}</DetailField>
        <DetailField label="Địa điểm">{job.location}</DetailField>
        <DetailField label="Mức lương">
          {formatCurrency(job.salary)}
        </DetailField>
        <DetailField label="Giờ làm việc">{job.workHours}</DetailField>
        <DetailField label="Liên hệ">{job.phoneContact}</DetailField>
      </div>

      <h3 className="text-xl font-bold text-blue-700 mt-10 mb-6">
        Mô tả công việc
      </h3>
      <div
        className="prose prose-sm max-w-none text-gray-900"
        dangerouslySetInnerHTML={{ __html: job.description || "N/A" }}
      />

      <h3 className="text-xl font-bold text-blue-700 mt-10 mb-6">
        Yêu cầu công việc
      </h3>
      <div
        className="prose prose-sm max-w-none text-gray-900"
        dangerouslySetInnerHTML={{ __html: job.requirements || "N/A" }}
      />
    </div>
  );
};
