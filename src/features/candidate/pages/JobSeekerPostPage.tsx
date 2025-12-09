import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Space,
  message,
  Button,
  Modal,
  Tag,
  Input,
  Select,
  Card,
  Typography,
  Tooltip,
  Pagination,
  Empty,
  Avatar,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { jobSeekerPostService } from "../services";
import jobSeekerCvService from "../../jobSeekerCv/services";
import type { JobSeekerPostDtoOut } from "../type";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import type { JobSeekerProfileDto } from "../../profile-JobSeeker/types";

import { getPublicJobSeekerProfile } from "../../profile-JobSeeker/services/service";
import { useCategories } from "../../category/hook";
import locationService, { type LocationOption } from "../../location/locationService";
import reportService from "../../report/reportService";

const trimText = (value?: string | null): string => (value ?? "").trim();

type CvWithDetails = JobSeekerCv & { experience?: string | null; education?: string | null };

const hasValue = (value?: string | null): boolean => trimText(value).length > 0;

const normalizeTimeValue = (value?: string | null): string => {
  const trimmed = trimText(value);
  if (!trimmed) {
    return "";
  }
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const [, hour, minute] = timeMatch;
    const normalizedHour = hour.padStart(2, "0").slice(-2);
    const normalizedMinute = minute.padStart(2, "0");
    return `${normalizedHour}:${normalizedMinute}`;
  }
  return trimmed;
};

const getContactPhone = (post: JobSeekerPostDtoOut): string => {
  const direct = trimText(post.phoneContact);
  if (direct) {
    return direct;
  }
  const fallback = trimText((post as { contactPhone?: string | null }).contactPhone);
  return fallback;
};

const hasWorkHourData = (post: JobSeekerPostDtoOut): boolean => {
  return (
    hasValue(post.preferredWorkHours) ||
    hasValue(post.preferredWorkHourStart) ||
    hasValue(post.preferredWorkHourEnd)
  );
};

const genderLabelMap: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  "nữ": "Nữ",
  other: "Khác",
};

const formatGenderLabel = (gender?: string | null): string => {
  if (!gender) return "";
  const key = gender.trim().toLowerCase();
  return genderLabelMap[key] ?? gender;
};

const shouldFetchDetail = (post: JobSeekerPostDtoOut): boolean => {
  const hasContact = Boolean(getContactPhone(post));
  const hasGender = hasValue(post.gender);
  const hasAge = typeof post.age === "number" && post.age > 0;
  return !(hasWorkHourData(post) && hasContact && hasGender && hasAge);
};

const getCvIdFromPost = (post: JobSeekerPostDtoOut): number | null => {
  const extended = post as {
    selectedCvId?: number | null;
    cvId?: number | null;
  };
  return extended.selectedCvId ?? extended.cvId ?? null;
};

const { Search, TextArea } = Input;
const { Option } = Select;

const JobSeekerPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<JobSeekerPostDtoOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cvModal, setCvModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    cv: CvWithDetails | null;
    error: string | null;
  }>({
    isOpen: false,
    loading: false,
    cv: null,
    error: null,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [reportModal, setReportModal] = useState<{
    visible: boolean;
    postId: number | null;
    postTitle: string;
    reason: string;
    submitting: boolean;
    reportType: string;
    customReportType: string;
  }>({
    visible: false,
    postId: null,
    postTitle: "",
    reason: "",
    submitting: false,
    reportType: "",
    customReportType: "",
  });

  const { categories, status: categoryStatus } = useCategories();

  const formatWorkHours = (record: JobSeekerPostDtoOut) => {
    if (hasValue(record.preferredWorkHours)) {
      return trimText(record.preferredWorkHours);
    }
    const start = normalizeTimeValue(record.preferredWorkHourStart);
    const end = normalizeTimeValue(record.preferredWorkHourEnd);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || "";
  };

  const hydratePostsWithDetails = useCallback(
    async (rawPosts: JobSeekerPostDtoOut[]) => {
      const pendingDetails = rawPosts.filter(shouldFetchDetail);
      if (!pendingDetails.length) {
        return rawPosts;
      }

      const detailMap = new Map<number, JobSeekerPostDtoOut>();
      const batchSize = 10;

      for (let i = 0; i < pendingDetails.length; i += batchSize) {
        const batch = pendingDetails.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (post) => {
            try {
              const response = await jobSeekerPostService.getJobSeekerPostById(post.jobSeekerPostId);
              if (response.success && response.data) {
                return response.data;
              }
            } catch {
              return null;
            }
            return null;
          })
        );

        batchResults.forEach((detail) => {
          if (detail) {
            detailMap.set(detail.jobSeekerPostId, detail);
          }
        });
      }

      if (!detailMap.size) {
        return rawPosts;
      }

      return rawPosts.map((post) => {
        const detail = detailMap.get(post.jobSeekerPostId);
        return detail ? { ...post, ...detail } : post;
      });
    },
    []
  );

  const attachProfiles = useCallback(async (rawPosts: JobSeekerPostDtoOut[]) => {
    const userIds = Array.from(new Set(rawPosts.map((p) => p.userID).filter(Boolean)));
    if (!userIds.length) return rawPosts;

    const profileMap = new Map<number, JobSeekerProfileDto>();

    await Promise.all(
      userIds.map(async (userId) => {
        try {
          const profile = await getPublicJobSeekerProfile(userId);
          if (profile) {
            profileMap.set(userId, profile);
          }
        } catch {
          // ignore failures for individual profiles
        }
      })
    );

    if (!profileMap.size) return rawPosts;

    return rawPosts.map((p) => {
      const profile = profileMap.get(p.userID);
      if (!profile) return p;
      return {
        ...p,
        seekerName: p.seekerName || profile.fullName || p.seekerName,
        phoneContact: p.phoneContact || profile.contactPhone || p.phoneContact,
        preferredLocation: p.preferredLocation || profile.location || p.preferredLocation,
        profilePicture: profile.profilePicture ?? p.profilePicture,
      };
    });
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await jobSeekerPostService.getAllJobSeekerPosts();
      if (res.success) {
        const enrichedPosts = await hydratePostsWithDetails(res.data);
        const withProfiles = await attachProfiles(enrichedPosts);
        setPosts(withProfiles);
      } else {
        setPosts([]);
      }
    } catch {
      message.error("Không thể tải danh sách bài đăng tìm việc.");
    } finally {
      setIsLoading(false);
    }
  }, [attachProfiles, hydratePostsWithDetails]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const loadProvinces = async () => {
      setProvinceLoading(true);
      try {
        const data = await locationService.getProvinces();
        setProvinceOptions(data);
      } catch {
        message.error("Không thể tải danh sách tỉnh/thành.");
      } finally {
        setProvinceLoading(false);
      }
    };
    void loadProvinces();
  }, []);

  const filteredPosts = useMemo(() => {
    let data = [...posts];

    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      data = data.filter((post) => {
        const titleMatch = trimText(post.title).toLowerCase().includes(keyword);
        const nameMatch = trimText(post.seekerName).toLowerCase().includes(keyword);
        return titleMatch || nameMatch;
      });
    }

    if (selectedCategoryId) {
      const selectedCategory = categories.find((cat) => cat.categoryId === selectedCategoryId);
      if (selectedCategory) {
        data = data.filter(
          (post) =>
            trimText(post.categoryName).toLowerCase() ===
            trimText(selectedCategory.name).toLowerCase()
        );
      }
    }

    if (selectedProvinceCode) {
      const selectedProvince = provinceOptions.find((province) => province.code === selectedProvinceCode);
      if (selectedProvince) {
        const provinceName = selectedProvince.name.toLowerCase();
        data = data.filter((post) =>
          trimText(post.preferredLocation).toLowerCase().includes(provinceName)
        );
      }
    }

    return data;
  }, [posts, searchValue, selectedCategoryId, categories, selectedProvinceCode, provinceOptions]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategoryId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleProvinceChange = (value: number | undefined) => {
    setSelectedProvinceCode(typeof value === "number" ? value : null);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleViewCv = useCallback(
    async (post: JobSeekerPostDtoOut) => {
      const cvId = getCvIdFromPost(post);
      if (!cvId) {
        message.info("Bài đăng này chưa đính kèm CV.");
        return;
      }
      setCvModal({ isOpen: true, loading: true, cv: null, error: null });
      try {
        const cv = await jobSeekerCvService.fetchCvForEmployer(cvId);
        setCvModal({ isOpen: true, loading: false, cv, error: null });
      } catch {
        setCvModal({
          isOpen: true,
          loading: false,
          cv: null,
          error: "Không thể tải CV. Vui lòng thử lại sau.",
        });
      }
    },
    []
  );

  const openReportModal = (post: JobSeekerPostDtoOut) => {
    setReportModal({
      visible: true,
      postId: post.jobSeekerPostId,
      postTitle: post.title,
      reason: "",
      submitting: false,
      reportType: "",
      customReportType: "",
    });
  };

  const handleSubmitReport = async () => {
    if (!reportModal.postId) {
      return;
    }
    const reason = reportModal.reason.trim();
    const selectedType = reportModal.reportType.trim();
    const customType = reportModal.customReportType.trim();
    const reportType = selectedType === "Other" ? customType : selectedType;
    if (!reportType) {
      message.warning("Vui lòng chọn loại báo cáo.");
      return;
    }
    if (!reason) {
      message.warning("Vui lòng nhập lý do báo cáo.");
      return;
    }
    setReportModal((prev) => ({ ...prev, submitting: true }));
    try {
      await reportService.reportPost({
        postId: reportModal.postId,
        affectedPostType: "JobSeekerPost",
        reportType,
        reason,
      });
      message.success("Đã gửi báo cáo bài đăng tìm việc.");
      setReportModal({
        visible: false,
        postId: null,
        postTitle: "",
        reason: "",
        submitting: false,
        reportType: "",
        customReportType: "",
      });
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(responseMessage || (error instanceof Error ? error.message : "Không thể gửi báo cáo. Vui lòng thử lại."));
      setReportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const totalPosts = filteredPosts.length;
  const startDisplay = totalPosts === 0 ? 0 : (pagination.current - 1) * pagination.pageSize + 1;
  const endDisplay = Math.min(pagination.current * pagination.pageSize, totalPosts);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-xl border-none rounded-3xl">
        <div className="flex flex-col gap-3 p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">Ứng viên</p>
            <Typography.Title level={3} className="!text-white !mb-1">
              Tìm ứng viên nhanh, mức lương minh bạch, lọc theo nhu cầu của bạn.
            </Typography.Title>
            <p className="text-white/85 max-w-4xl text-sm md:text-base">
              Lọc theo từ khóa, ngành nghề và địa điểm để kết nối ứng viên phù hợp nhất.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center shadow-lg">
            <Search
              placeholder="Nhập vị trí, chức danh, kỹ năng..."
              allowClear
              enterButton="Tìm kiếm"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onSearch={handleSearchChange}
              loading={isLoading}
              className="w-full md:flex-1"
              size="large"
            />
            <Select
              placeholder="Ngành nghề"
              allowClear
              value={selectedCategoryId ?? undefined}
              onChange={(value) => handleCategoryChange(value ?? null)}
              loading={categoryStatus === "loading"}
              className="w-full md:w-64"
              size="large"
            >
              {categories.map((cat) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Tỉnh/Thành"
              allowClear
              showSearch
              optionFilterProp="children"
              value={selectedProvinceCode ?? undefined}
              onChange={(value) => handleProvinceChange(value as number | undefined)}
              loading={provinceLoading}
              className="w-full md:w-64"
              size="large"
              filterOption={(input, option) =>
                String(option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {provinceOptions.map((province) => (
                <Option key={province.code} value={province.code}>
                  {province.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-semibold">
              Tổng bài đăng: {totalPosts}
            </span>
            {totalPosts > 0 && (
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 font-semibold">
                Hiển thị {startDisplay} - {endDisplay}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="bg-white p-6 rounded-3xl shadow-[0_15px_60px_rgba(15,23,42,0.08)] border border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{totalPosts} ứng viên được tìm thấy</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Đang tải danh sách...</div>
        ) : filteredPosts.length === 0 ? (
          <Empty description="Không tìm thấy ứng viên phù hợp" />
        ) : (
          <div className="space-y-4">
            {filteredPosts
              .slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize)
              .map((post) => {
                const workHours = formatWorkHours(post);
                const phone = getContactPhone(post);
                return (
                  <Card
                    key={post.jobSeekerPostId}
                    className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
                    styles={{ body: { padding: 16 } }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <Avatar
                        size={52}
                        src={post.profilePicture || undefined}
                        icon={<UserOutlined />}
                        className="bg-slate-200 text-slate-600"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <div className="text-sm text-slate-500 font-semibold">
                              {post.seekerName || "Ứng viên"}
                            </div>
                            <Typography.Title level={5} className="!m-0 text-slate-900">
                              {post.title}
                            </Typography.Title>
                          </div>
                          <span className="text-xs text-slate-500">
                            Cập nhật:{" "}
                            {post.updatedAt
                              ? new Date(post.updatedAt).toLocaleDateString("vi-VN")
                              : new Date(post.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Tag icon={<EnvironmentOutlined />} color="default">
                            {post.preferredLocation || "Địa điểm linh hoạt"}
                          </Tag>
                          <Tag icon={<ClockCircleOutlined />} color="blue">
                            {workHours || "Chưa rõ giờ"}
                          </Tag>
                          <Tag color="cyan">{post.categoryName || "Chưa chọn ngành"}</Tag>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap text-sm text-slate-600">
                          <Space>
                            <PhoneOutlined /> {phone || "Chưa có số liên hệ"}
                          </Space>
                        {post.age ? <Tag color="geekblue">{post.age} tuổi</Tag> : null}
                          {formatGenderLabel(post.gender) ? (
                            <Tag color="purple">{formatGenderLabel(post.gender)}</Tag>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap md:justify-end">
                          <Button
                            type="primary"
                            ghost
                            size="middle"
                            onClick={() => handleViewCv(post)}
                            disabled={!getCvIdFromPost(post)}
                          >
                            Xem CV
                          </Button>
                          <Link to={`/nha-tuyen-dung/tim-kiem/ung-vien/${post.jobSeekerPostId}`}>
                            <Button type="primary" size="middle">
                              Xem chi tiết
                            </Button>
                          </Link>
                          <Tooltip title="Báo cáo bài đăng tìm việc">
                            <Button
                              type="text"
                              size="middle"
                              icon={<ExclamationCircleOutlined style={{ color: "#dc2626" }} />}
                              onClick={() => openReportModal(post)}
                            >
                              Báo cáo
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}

        {filteredPosts.length > pagination.pageSize && (
          <div className="mt-6 flex justify-center">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={filteredPosts.length}
              showSizeChanger
              showTotal={(total, range) => `${range[0]}-${range[1]} / ${total}`}
              onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
            />
          </div>
        )}

        {/* Modal CV */}
        <Modal
          title={cvModal.cv?.cvTitle || "CV ứng viên"}
          open={cvModal.isOpen}
          footer={null}
          onCancel={() =>
            setCvModal({
              isOpen: false,
              loading: false,
              cv: null,
              error: null,
            })
          }
          width={650}
        >
          {cvModal.loading ? (
            <p>Đang tải CV...</p>
          ) : cvModal.error ? (
            <p className="text-red-500">{cvModal.error}</p>
          ) : cvModal.cv ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">Thông tin chung</h3>
                <p>
                  <span className="font-semibold">Tiêu đề:</span> {cvModal.cv.cvTitle}
                </p>
                {cvModal.cv.preferredJobType && (
                  <p>
                    <span className="font-semibold">Công việc mong muốn:</span>{" "}
                    {cvModal.cv.preferredJobType}
                  </p>
                )}
                {cvModal.cv.preferredLocationName && (
                  <p>
                    <span className="font-semibold">Khu vực mong muốn:</span>{" "}
                    {cvModal.cv.preferredLocationName}
                  </p>
                )}
                {cvModal.cv.contactPhone && (
                  <p>
                    <span className="font-semibold">Liên hệ:</span> {cvModal.cv.contactPhone}
                  </p>
                )}
              </div>

              {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Kỹ năng</h3>
                  {cvModal.cv.skillSummary && (
                    <p className="text-gray-700">{cvModal.cv.skillSummary}</p>
                  )}
                  {cvModal.cv.skills && (
                    <div className="mt-2">
                      {cvModal.cv.skills.split(",").map((skill, idx) => (
                        <Tag key={idx} color="blue" className="mb-1">
                          {skill.trim()}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {cvModal.cv.experience && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Kinh nghiệm</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {cvModal.cv.experience}
                  </p>
                </div>
              )}

              {cvModal.cv.education && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Học vấn</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {cvModal.cv.education}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 text-right">
                Cập nhật: {new Date(cvModal.cv.updatedAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ) : (
            <p>Không tìm thấy CV.</p>
          )}
        </Modal>

        <Modal
          title={
            reportModal.postTitle
              ? `Báo cáo bài đăng: ${reportModal.postTitle}`
              : "Báo cáo bài đăng"
          }
          open={reportModal.visible}
          onCancel={() =>
            setReportModal({
              visible: false,
              postId: null,
              postTitle: "",
              reason: "",
              submitting: false,
              reportType: "",
              customReportType: "",
            })
          }
          onOk={handleSubmitReport}
          okText="Gửi báo cáo"
          cancelText="Hủy"
          confirmLoading={reportModal.submitting}
        >
          <p className="text-sm text-gray-600 mb-3">
            Vui lòng mô tả lý do bạn muốn báo cáo bài đăng tìm việc này. Thông tin sẽ được gửi tới
            quản trị viên.
          </p>
          <div className="mb-3">
            <Select
              placeholder="Chọn loại báo cáo"
              className="w-full"
              value={reportModal.reportType || undefined}
              onChange={(value) => setReportModal((prev) => ({ ...prev, reportType: value }))}
              options={[
                { label: "Tin giả / lừa đảo", value: "Fraud" },
                { label: "Nội dung không phù hợp", value: "Inappropriate" },
                { label: "Trùng lặp / Spam", value: "Spam" },
                { label: "Khác", value: "Other" },
              ]}
            />
          </div>
          {reportModal.reportType === "Other" && (
            <div className="mb-3">
              <Input
                placeholder="Nhập loại báo cáo khác"
                value={reportModal.customReportType}
                onChange={(e) =>
                  setReportModal((prev) => ({
                    ...prev,
                    customReportType: e.target.value,
                  }))
                }
              />
            </div>
          )}
          <TextArea
            rows={4}
            value={reportModal.reason}
            placeholder="Ví dụ: Bài đăng có nội dung không phù hợp..."
            onChange={(e) => setReportModal((prev) => ({ ...prev, reason: e.target.value }))}
          />
        </Modal>
      </div>
    </div>
  );
};

export default JobSeekerPostsPage;
