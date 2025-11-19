import React from "react";
import type { JobPostView } from "../../jobTypes";

interface AISuggestion {
  title?: string;
  seekerName?: string;
  preferredLocation?: string;
  description?: string;
  matchPercent?: number;
}

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

export const JobDetailSuggest: React.FC<{
  job: JobPostView;
  suggestions?: AISuggestion[];
}> = ({ job, suggestions = [] }) => {
  return (
    <div className="p-6">
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

      <h3 className="text-xl font-bold text-green-700 mt-12 mb-4">
        Ứng viên phù hợp (AI đề xuất)
      </h3>

      {!suggestions || suggestions.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có ứng viên phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s, idx) => (
            <div
              key={`${s.seekerName}-${idx}`}
              className="p-4 border rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-lg font-bold">{s.title || "Ứng viên"}</p>
                  <p className="text-gray-600">{s.seekerName || "N/A"}</p>
                  <p className="text-gray-500">
                    {s.preferredLocation || "Chưa cập nhật"}
                  </p>
                </div>
                {s.matchPercent !== undefined && (
                  <p className="text-blue-600 font-semibold">
                    {Math.round(s.matchPercent)}% phù hợp
                  </p>
                )}
              </div>

              {s.description && (
                <p className="text-sm text-gray-700 mt-2">
                  {s.description.slice(0, 180)}
                  {s.description.length > 180 ? "..." : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobDetailSuggest;
