import React from "react";
import { Tag } from "antd";
import type { AdminEmployerPostDetailView } from "../type";

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return 'Thỏa thuận';
  return `${value.toLocaleString('vi-VN')} VNĐ`;
};

const DetailField: React.FC<{ label: string; children: React.ReactNode; isHtml?: boolean }> = ({
  label,
  children,
  isHtml = false,
}) => (
  <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
    <span className="font-semibold text-gray-600 text-right pr-2">
      {label}:
    </span>
    {isHtml ? (
       <div
          className="prose prose-sm max-w-none text-gray-900 col-span-2"
          dangerouslySetInnerHTML={{ __html: (children as string) || "N/A" }}
        />
    ) : (
      <span className="col-span-2 text-gray-900">{children || "N/A"}</span>
    )}
  </div>
);

const JobEmployerDetailView: React.FC<{ post: AdminEmployerPostDetailView }> = ({ post }) => {
  return (
    <div className="p-2">
      <DetailField label="ID Bài đăng">{post.employerPostId}</DetailField>
      <DetailField label="Tiêu đề">{post.title}</DetailField>
      <DetailField label="Email NTD">{post.employerEmail}</DetailField>
      <DetailField label="Tên NTD">{post.employerName}</DetailField>
      <DetailField label="Địa điểm">{post.location}</DetailField>
      <DetailField label="Lương">{formatCurrency(post.salary)}</DetailField>
      <DetailField label="Giờ làm việc">{post.workHours}</DetailField>
      <DetailField label="Ngành nghề">{post.categoryName}</DetailField>
      <DetailField label="Liên hệ">{post.phoneContact}</DetailField>
      <DetailField label="Trạng thái">
        <Tag color={post.status === "Active" ? "green" : "red"}>
          {post.status}
        </Tag>
      </DetailField>
      <DetailField label="Ngày tạo">
        {new Date(post.createdAt).toLocaleString("vi-VN")}
      </DetailField>
      
      <DetailField label="Mô tả" isHtml>{post.description}</DetailField>
      <DetailField label="Yêu cầu" isHtml>{post.requirements}</DetailField>
    </div>
  );
};

export default JobEmployerDetailView;