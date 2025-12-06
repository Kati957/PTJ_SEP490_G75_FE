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
type CvDetail = JobSeekerCv & { experience?: string | null; education?: string | null };

const formatDate = (date?: string | Date | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN");
};

const genderLabelMap: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  "n?": "Nữ",
  other: "Khác",
};

const formatGenderLabel = (gender?: string | null): string => {
  if (!gender) return "";
  const key = gender.trim().toLowerCase();
  return genderLabelMap[key] ?? gender;
};

const JobSeekerPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<JobSeekerPostDtoOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvModal, setCvModal] = useState<{
    loading: boolean;
    cv: CvDetail | null;
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
      setError("KhÃ´ng xÃ¡c Ä‘á»‹nh Ä‘Æ°á»£c bÃ i Ä‘Äƒng.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await jobSeekerPostService.getJobSeekerPostById(Number(id));
      if (!res.success || !res.data) {
        throw new Error("KhÃ´ng tÃ¬m tháº¥y bÃ i Ä‘Äƒng.");
      }
      setPost(res.data);
    } catch (err) {
      const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(responseMessage || (err instanceof Error ? err.message : "Kh?ng th? t?i b?i ??ng."));
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
  const seekerName = post?.seekerName || profile?.fullName || "á»¨ng viÃªn";
  const contactPhone = post?.phoneContact || profile?.contactPhone;
  const preferredLocation = post?.preferredLocation || profile?.location;

  const handleViewCv = async () => {
    if (!post?.cvId) {
      message.info("B?i ??ng n?y ch?a ??nh k?m CV.");
      return;
    }
    if (cvModal.cv && !cvModal.loading) {
      setCvModal((prev) => ({ ...prev, open: !prev.open }));
      return;
    }
    setCvModal({ loading: true, cv: null, error: null, open: true });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(post.cvId);
      setCvModal({ loading: false, cv, error: null, open: true });
    } catch (err) {
      const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCvModal({
        loading: false,
        cv: null,
        error: responseMessage || (err instanceof Error ? err.message : "Kh?ng th? t?i CV."),
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
      message.warning("Vui lÃ²ng chá»n loáº¡i bÃ¡o cÃ¡o.");
      return;
    }
    if (!reportModal.reason.trim()) {
      message.warning("Vui lÃ²ng nháº­p lÃ½ do bÃ¡o cÃ¡o.");
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
      message.success("ÄÃ£ gá»­i bÃ¡o cÃ¡o.");
      setReportModal({ open: false, submitting: false, reportType: "", reason: "" });
    } catch (err) {
      const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(responseMessage || (err instanceof Error ? err.message : "Kh?ng th? g?i b?o c?o."));
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
          <p className="text-red-500">{error || "KhÃ´ng tÃ¬m tháº¥y bÃ i Ä‘Äƒng."}</p>
          <Button className="mt-3" onClick={fetchDetail}>
            Thá»­ láº¡i
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
                  {seekerName} â€¢ {post.categoryName || "ChÆ°a chá»n ngÃ nh"}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                  <Tag color="geekblue" icon={<CalendarOutlined />}>
                  Dang ngay {formatDate(post.createdAt)}
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
                BÃ¡o cÃ¡o
              </Button>
            </Space>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <EnvironmentOutlined /> Äá»‹a Ä‘iá»ƒm
              </div>
              <div className="font-semibold text-slate-900">
                {preferredLocation || "Äá»‹a Ä‘iá»ƒm linh hoáº¡t"}
              </div>
            </Card>
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <ClockCircleOutlined /> Gio lam mong muon
              </div>
              <div className="font-semibold text-slate-900">{workHours || "ChÆ°a rÃµ"}</div>
            </Card>
            <Card
              className="rounded-2xl shadow-sm border-none bg-white/90 backdrop-blur-sm"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <PhoneOutlined /> LiÃªn há»‡
              </div>
              <div className="font-semibold text-slate-900">
                {contactPhone || "ChÆ°a cÃ³ sá»‘ liÃªn há»‡"}
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <Title level={4}>ThÃ´ng tin thÃªm</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <Text type="secondary">Nganh nghe</Text>
                <div className="font-semibold">{post.categoryName || "ChÆ°a chá»n"}</div>
              </div>
              <div>
                                  <Text type="secondary">Giới tính</Text>
                  <div className="font-semibold">{formatGenderLabel(post.gender) || "Không yêu cầu"}</div>
              </div>
              <div>
                <Text type="secondary">Äá»™ tuá»•i</Text>
                <div className="font-semibold">{post.age ? `${post.age} tuá»•i` : "KhÃ´ng yÃªu cáº§u"}</div>
              </div>
              <div>
                <Text type="secondary">Tráº¡ng thÃ¡i</Text>
                <div className="font-semibold">{post.status || "N/A"}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <Title level={4}>Tong quan bai dang</Title>
            <Paragraph className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.description || "ChÆ°a cÃ³ mÃ´ táº£ chi tiáº¿t."}
            </Paragraph>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <Avatar size={48} src={avatarSrc} icon={<UserOutlined />} />
              <div>
                <div className="font-semibold text-slate-900">{seekerName}</div>
                <div className="text-xs text-slate-500">Ung vien dang bai</div>
              </div>
            </div>
            <Space direction="vertical" className="w-full text-sm text-slate-700">
              <span>
                <EnvironmentOutlined /> {preferredLocation || "Äá»‹a Ä‘iá»ƒm linh hoáº¡t"}
              </span>
              <span>
                <PhoneOutlined /> {contactPhone || "ChÆ°a cÃ³ sá»‘ liÃªn há»‡"}
              </span>
            </Space>
            {post.cvId ? (
              <Button block type="primary" ghost className="mt-3" onClick={handleViewCv}>
                {cvModal.loading ? "Äang táº£i CV..." : cvModal.open ? "áº¨n CV" : "Xem CV Ä‘Ã­nh kÃ¨m"}
              </Button>
            ) : null}
          </Card>

          {cvModal.open && (
            <Card className="rounded-2xl shadow-sm border border-slate-100">
              {cvModal.loading ? (
                <p>Äang táº£i CV...</p>
              ) : cvModal.error ? (
                <p className="text-red-500">{cvModal.error}</p>
              ) : cvModal.cv ? (
                <div className="space-y-4 text-sm">
                  <div className="p-3 rounded-lg border bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-1">ThÃ´ng tin chung</h3>
                    <p>
                      <span className="font-semibold">TiÃªu Ä‘á»:</span> {cvModal.cv.cvTitle}
                    </p>
                    {cvModal.cv.preferredJobType && (
                      <p>
                        <span className="font-semibold">CÃ´ng viá»‡c mong muá»‘n:</span>{" "}
                        {cvModal.cv.preferredJobType}
                      </p>
                    )}
                    {cvModal.cv.preferredLocationName && (
                      <p>
                        <span className="font-semibold">Khu vá»±c mong muá»‘n:</span>{" "}
                        {cvModal.cv.preferredLocationName}
                      </p>
                    )}
                    {cvModal.cv.contactPhone && (
                      <p>
                        <span className="font-semibold">LiÃªn há»‡:</span> {cvModal.cv.contactPhone}
                      </p>
                    )}
                  </div>

                  {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-1">Ká»¹ nÄƒng</h3>
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
                      <h3 className="font-semibold text-gray-700 mb-1">Kinh nghiá»‡m</h3>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {cvModal.cv.experience}
                      </p>
                    </div>
                  )}

                  {cvModal.cv.education && (
                    <div className="p-3 rounded-lg border bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-1">Há»c váº¥n</h3>
                      <p className="whitespace-pre-wrap text-gray-700">
                        {cvModal.cv.education}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-right">
                    Cáº­p nháº­t: {new Date(cvModal.cv.updatedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ) : (
                <p>KhÃ´ng tÃ¬m tháº¥y CV.</p>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal
        title={`Bao cao bai dang${post.title ? `: ${post.title}` : ""}`}
        open={reportModal.open}
        onCancel={() =>
          setReportModal({ open: false, submitting: false, reportType: "", reason: "" })
        }
        onOk={submitReport}
        confirmLoading={reportModal.submitting}
        okText="Gá»­i bÃ¡o cÃ¡o"
        cancelText="Há»§y"
      >
        <p className="text-sm text-gray-600 mb-3">
          Vui long mo ta ly do ban muon bao cao bai dang tim viec nay. Thong tin se duoc gui toi quan
          trá»‹ viÃªn.
        </p>
        <div className="mb-3">
          <Select
            placeholder="Chá»n loáº¡i bÃ¡o cÃ¡o"
            className="w-full"
            value={reportModal.reportType || undefined}
            onChange={(value) => setReportModal((prev) => ({ ...prev, reportType: value }))}
            options={[
              { label: "Tin giáº£ / lá»«a Ä‘áº£o", value: "Fraud" },
              { label: "Ná»™i dung khÃ´ng phÃ¹ há»£p", value: "Inappropriate" },
              { label: "Spam", value: "Spam" },
              { label: "KhÃ¡c", value: "Other" },
            ]}
          />
        </div>
        <Input.TextArea
          rows={4}
          placeholder="VÃ­ dá»¥: BÃ i Ä‘Äƒng cÃ³ ná»™i dung khÃ´ng phÃ¹ há»£p..."
          value={reportModal.reason}
          onChange={(e) => setReportModal((prev) => ({ ...prev, reason: e.target.value }))}
        />
      </Modal>
    </div>
  );
};

export default JobSeekerPostDetailPage;


