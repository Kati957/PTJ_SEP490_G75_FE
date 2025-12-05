import React, { useEffect, useState } from "react";
import {
  Spin,
  Typography,
  Row,
  Col,
  Tag,
  Divider,
  Rate,
  List,
  Avatar,
  Pagination,
  Card,
} from "antd";
import {
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEmployerDetail } from "../hooks";
import JobCard from "../../../features/homepage-jobSeeker/components/JobCard";
import ratingService from "../../../services/ratingService";
import type { Rating } from "../../../types/profile";
import type { Job } from "../../../types";

const { Title, Paragraph } = Typography;
const pageSize = 6;

const EmployerDetailPage: React.FC = () => {
  const { profile, jobs, loading, error } = useEmployerDetail();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const getPlainText = (html: string) => {
    if (!html) return "Chưa có mô tả giới thiệu.";
    const tempDiv =
      typeof window !== "undefined" ? document.createElement("div") : null;
    if (!tempDiv) return "Chưa có mô tả giới thiệu.";
    tempDiv.innerHTML = html;
    return tempDiv.innerText || "Chưa có mô tả giới thiệu.";
  };

  useEffect(() => {
    if (profile?.userId) {
      const userIdNum = Number(profile.userId);
      if (!Number.isNaN(userIdNum)) {
        Promise.all([
          ratingService.getAverageRatingForUser(userIdNum),
          ratingService.getRatingsForUser(userIdNum),
        ])
          .then(([avg, list]) => {
            setAverageRating(avg);
            setRatings(list);
          })
          .catch((err) => console.error("Failed to fetch ratings", err));
      }
    }
  }, [profile?.userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [jobs.length]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mt-10 text-center text-red-500">
        {error || "Không tìm thấy thông tin nhà tuyển dụng."}
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a5f] via-[#295f8b] to-[#2b6cb0] pb-16 pt-10">
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white/20 backdrop-blur shadow-lg ring-2 ring-white/40">
              <img
                src={profile.avatarUrl || "https://via.placeholder.com/150"}
                alt={profile.displayName}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-100">
                Nhà tuyển dụng
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                {profile.displayName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-sky-50">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 hover:bg-white/20"
                  >
                    <GlobalOutlined /> Website
                  </a>
                )}
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <EnvironmentOutlined />{" "}
                  {profile.location || "Chưa cập nhật địa chỉ"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-sky-100">
                Đánh giá
              </p>
              <div className="text-3xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <Rate
                disabled
                allowHalf
                value={averageRating}
                className="text-sm text-yellow-300"
              />
              <p className="text-xs text-sky-100">
                {ratings.length} đánh giá
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-6 px-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm" bodyStyle={{ padding: 24 }}>
                <div className="flex items-center justify-between">
                  <Title level={4} className="!mb-0">
                    Giới thiệu công ty
                  </Title>
                  <Tag color="blue">Thông tin</Tag>
                </div>
                <Paragraph className="mt-3 leading-relaxed text-slate-700">
                  {getPlainText(profile.description)}
                </Paragraph>
              </Card>

              <Card className="rounded-2xl shadow-sm" bodyStyle={{ padding: 24 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Title level={4} className="!mb-0">
                    Tuyển dụng
                  </Title>
                  <Tag color="blue" className="rounded px-3 py-1 text-base">
                    {jobs.length} vị trí đang mở
                  </Tag>
                </div>

                {paginatedJobs.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {paginatedJobs.map((job: Job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border border-slate-100 transition-shadow hover:shadow-md"
                      >
                        <JobCard job={job} />
                      </div>
                    ))}
                    <div className="flex justify-center pt-2">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={jobs.length}
                        showSizeChanger={false}
                        onChange={setCurrentPage}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl bg-slate-50 py-10 text-center text-gray-500">
                    Hiện nhà tuyển dụng chưa có tin đăng nào.
                  </div>
                )}
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-sm" bodyStyle={{ padding: 24 }}>
              <Title level={4} className="!mb-4">
                Thông tin liên hệ
              </Title>
              <div className="space-y-4 text-slate-700">
                <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="mt-1 text-lg text-emerald-600" />
                  <div>
                    <p className="mb-0 font-semibold">Địa chỉ công ty</p>
                    <p className="text-sm text-slate-600">
                      {profile.location || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                {profile.contactEmail && (
                  <>
                    <Divider className="my-2" />
                    <div className="flex items-start gap-3">
                      <MailOutlined className="mt-1 text-lg text-emerald-600" />
                      <div>
                        <p className="mb-0 font-semibold">Email liên hệ</p>
                        <a
                          href={`mailto:${profile.contactEmail}`}
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          {profile.contactEmail}
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {profile.contactPhone && (
                  <>
                    <Divider className="my-2" />
                    <div className="flex items-start gap-3">
                      <PhoneOutlined className="mt-1 text-lg text-emerald-600" />
                      <div>
                        <p className="mb-0 font-semibold">Điện thoại</p>
                        <p className="text-sm text-slate-600">
                          {profile.contactPhone}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card
              className="mt-6 rounded-2xl shadow-sm"
              bodyStyle={{ padding: 24 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <Title level={4} className="!mb-0">
                  Đánh giá từ ứng viên
                </Title>
                <Tag color="gold">{ratings.length} đánh giá</Tag>
              </div>
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {averageRating.toFixed(1)}
                  </div>
                  <Rate
                    disabled
                    allowHalf
                    value={averageRating}
                    className="text-sm text-yellow-500"
                  />
                  <div className="text-xs text-slate-500">Trung bình</div>
                </div>
              </div>

              <List
                itemLayout="horizontal"
                dataSource={ratings}
                pagination={{ pageSize: 5, size: "small" }}
                locale={{ emptyText: "Chưa có đánh giá nào" }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: "#fde3cf",
                            color: "#f56a00",
                          }}
                        >
                          {item.raterName?.[0]?.toUpperCase() || "U"}
                        </Avatar>
                      }
                      title={
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.raterName || "Người dùng ẩn danh"}
                          </span>
                          <Rate
                            disabled
                            allowHalf
                            value={item.ratingValue}
                            className="text-xs text-yellow-500"
                          />
                        </div>
                      }
                      description={
                        <div className="mt-1">
                          <div className="text-sm text-slate-700">
                            {item.comment || "Không có nhận xét"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EmployerDetailPage;
