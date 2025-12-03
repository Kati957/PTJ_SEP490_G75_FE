import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Skeleton,
  Modal,
  message,
  Avatar,
  Select,
  Input,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { jobSeekerPostService } from "../services";
import type { JobSeekerPostDtoOut } from "../type";
import jobSeekerCvService from "../../jobSeekerCv/services";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import type { JobSeekerProfileDto } from "../../profile-JobSeeker/types";
import { getPublicJobSeekerProfile } from "../../profile-JobSeeker/services/service";
import reportService from "../../report/reportService";

const { Title, Paragraph, Text } = Typography;

const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN");
};

const JobSeekerPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<JobSeekerPostDtoOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvModal, setCvModal] = useState<{
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
    open: boolean;
  }>({ loading: false, cv: null, error: null, open: false });
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    submitting: boolean;
    reportType: string;
    reason: string;
  }>({
    open: false,
    submitting: false,
    reportType: "",
    reason: "",
  });
  const [profile, setProfile] = useState<JobSeekerProfileDto | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError("Không xác định được bài đăng.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await jobSeekerPostService.getJobSeekerPostById(Number(id));
      if (!res.success || !res.data) {
        throw new Error("Không tìm thấy bài đăng.");
      }
      setPost(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải bài đăng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!post?.userID) return;
      try {
        const res = await getPublicJobSeekerProfile(post.userID);
        setProfile(res);
      } catch {
        // ignore
      }
    };
    void loadProfile();
  }, [post?.userID]);

  const workHours = useMemo(() => {
    if (!post) return "";
    if (post.preferredWorkHours) return post.preferredWorkHours;
    const start = post.preferredWorkHourStart;
    const end = post.preferredWorkHourEnd;
    if (start && end) return `${start} - ${end}`;
    return start || end || "";
  }, [post]);

  const avatarSrc = profile?.profilePicture || post?.profilePicture || undefined;
  const seekerName = post?.seekerName || profile?.fullName || "Ứng viên";
  const contactPhone = post?.phoneContact || profile?.contactPhone;
  const preferredLocation = post?.preferredLocation || profile?.location;

  const handleViewCv = async () => {
    if (!post?.cvId) {
      message.info("Bài đăng này chưa đính kèm CV.");
      return;
    }
    // Toggle khi đã tải CV
    if (cvModal.cv && !cvModal.loading) {
      setCvModal((prev) => ({ ...prev, open: !prev.open }));
      return;
    }
    setCvModal({ loading: true, cv: null, error: null, open: true });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(post.cvId);
      setCvModal({ loading: false, cv, error: null, open: true });
    } catch (err: any) {
      setCvModal({
        loading: false,
        cv: null,
        error: err?.response?.data?.message || "Không thể tải CV.",
        open: true,
      });
    }
  };

  const handleReport = () => {
    if (!post) return;
    setReportModal({ open: true, submitting: false, reportType: "", reason: "" });
  };

  const submitReport = async () => {
    if (!post) return;
    if (!reportModal.reportType.trim()) {
      message.warning("Vui lòng chọn loại báo cáo.");
      return;
    }
    if (!reportModal.reason.trim()) {
      message.warning("Vui lòng nhập lý do báo cáo.");
      return;
    }
    setReportModal((prev) => ({ ...prev, submitting: true }));
    try {
      await reportService.reportPost({
        postId: post.jobSeekerPostId,
        affectedPostType: "JobSeekerPost",
        reportType: reportModal.reportType,
        reason: reportModal.reason.trim(),
      });
      message.success("Đã gửi báo cáo.");
      setReportModal({ open: false, submitting: false, reportType: "", reason: "" });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể gửi báo cáo.");
      setReportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-slate-200">
          <p className="text-red-500">{error || "Không tìm thấy bài đăng."}</p>
          <Button className="mt-3" onClick={fetchDetail}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-xl border-none rounded-3xl">
        <div className="p-6 md:p-8 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start gap-3">
              <Avatar
                size={64}
                src={avatarSrc}
                icon={<UserOutlined />}
                className="bg-white/30 text-white"
              />
              <div>
                <Title level={3} className="!text-white !mb-1">
                  {post.title}
                </Title>
                <div className="text-white/90">
                  {seekerName} • {post.categoryName || "Chưa chọn ngành"}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <Tag color="geekblue" icon={<CalendarOutlined />}>
                    Đăng ngày {formatDate(post.createdAt)}
                  </Tag>
                  {post.categoryName && <Tag color="blue">{post.categoryName}</Tag>}
                </div>
              </div>
            </div>
            <Space>
              <Button
                ghost
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={handleReport}
              >
                Báo cáo
              </Button>
            </Space>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <EnvironmentOutlined /> Địa điểm
              </div>
              <div className="font-semibold text-slate-900">
                {preferredLocation || "Địa điểm linh hoạt"}
              </div>
            </Card>
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <ClockCircleOutlined /> Giờ làm mong muốn
              </div>
              <div className="font-semibold text-slate-900">{workHours || "Chưa rõ"}</div>
            </Card>
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <PhoneOutlined /> Liên hệ
              </div>
              <div className="font-semibold text-slate-900">
                {contactPhone || "Chưa có số liên hệ"}
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <Title level={4}>Thông tin thêm</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <Text type="secondary">Ngành nghề</Text>
                <div className="font-semibold">{post.categoryName || "Chưa chọn"}</div>
              </div>
              <div>
                <Text type="secondary">Giới tính</Text>
                <div className="font-semibold">{post.gender || "Không yêu cầu"}</div>
              </div>
              <div>
                <Text type="secondary">Độ tuổi</Text>
                <div className="font-semibold">{post.age ? `${post.age} tuổi` : "Không yêu cầu"}</div>
              </div>
              <div>
                <Text type="secondary">Trạng thái</Text>
                <div className="font-semibold">{post.status || "N/A"}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <Title level={4}>Tổng quan bài đăng</Title>
            <Paragraph className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.description || "Chưa có mô tả chi tiết."}
            </Paragraph>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <Avatar size={48} src={avatarSrc} icon={<UserOutlined />} />
              <div>
                <div className="font-semibold text-slate-900">{seekerName}</div>
                <div className="text-xs text-slate-500">Ứng viên đăng bài</div>
              </div>
            </div>
            <Space direction="vertical" className="w-full text-sm text-slate-700">
              <span>
                <EnvironmentOutlined /> {preferredLocation || "Địa điểm linh hoạt"}
              </span>
              <span>
                <PhoneOutlined /> {contactPhone || "Chưa có số liên hệ"}
              </span>
            </Space>
            {post.cvId ? (
              <Button block type="primary" ghost className="mt-3" onClick={handleViewCv}>
                {cvModal.loading ? "Đang tải CV..." : cvModal.open ? "Ẩn CV" : "Xem CV đính kèm"}
              </Button>
            ) : null}
          </Card>

          {cvModal.open && (
            <Card className="rounded-2xl shadow-sm border border-slate-100">
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

                  {(cvModal.cv as any).experience && (
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-1">Kinh nghiệm</h3>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {(cvModal.cv as any).experience}
                      </p>
                    </div>
                  )}

                  {(cvModal.cv as any).education && (
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-1">Học vấn</h3>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {(cvModal.cv as any).education}
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
            </Card>
          )}
        </div>
      </div>

      <Modal
        title={`Báo cáo bài đăng${post.title ? `: ${post.title}` : ""}`}
        open={reportModal.open}
        onCancel={() =>
          setReportModal({ open: false, submitting: false, reportType: "", reason: "" })
        }
        onOk={submitReport}
        confirmLoading={reportModal.submitting}
        okText="Gửi báo cáo"
        cancelText="Hủy"
      >
        <p className="text-sm text-gray-600 mb-3">
          Vui lòng mô tả lý do bạn muốn báo cáo bài đăng tìm việc này. Thông tin sẽ được gửi tới quản
          trị viên.
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
              { label: "Spam", value: "Spam" },
              { label: "Khác", value: "Other" },
            ]}
          />
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Ví dụ: Bài đăng có nội dung không phù hợp..."
          value={reportModal.reason}
          onChange={(e) => setReportModal((prev) => ({ ...prev, reason: e.target.value }))}
        />
      </Modal>
    </div>
  );
};

export default JobSeekerPostDetailPage;
