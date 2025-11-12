import React from "react";
import { Tag } from "antd";
import type { AdminJobSeekerPostView } from "../type";

const JobJSDetailView: React.FC<{ post: AdminJobSeekerPostView }> = ({ post }) => {
  const DetailField: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
  }) => (
    <div className="grid grid-cols-3 gap-2 py-2">
      <span className="font-semibold text-gray-600 text-right pr-2">
        {label}:
      </span>
      <span className="col-span-2 text-gray-900">{children || "N/A"}</span>
    </div>
  );

  return (
    <div className="p-2">
      <DetailField label="ID Bài đăng">{post.jobSeekerPostId}</DetailField>
      <DetailField label="Tiêu đề">{post.title}</DetailField>
      <DetailField label="Email Người tìm việc">{post.jobSeekerEmail}</DetailField>
      <DetailField label="Giới tính">{post.gender}</DetailField>
      <DetailField label="Địa điểm mong muốn">{post.preferredLocation}</DetailField>
      <DetailField label="Giờ làm mong muốn">{post.preferredWorkHours}</DetailField>
      <DetailField label="Ngành nghề">{post.categoryName}</DetailField>
      <DetailField label="Mô tả">{post.description}</DetailField>
      <DetailField label="Trạng thái">
        <Tag color={post.status === "Active" ? "green" : "red"}>
          {post.status}
        </Tag>
      </DetailField>
      <DetailField label="Ngày tạo">
        {new Date(post.createdAt).toLocaleString("vi-VN")}
      </DetailField>
    </div>
  );
};

export default JobJSDetailView;
