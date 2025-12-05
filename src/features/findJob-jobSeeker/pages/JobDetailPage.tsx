import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, message, Modal, Form, Input, Select, Tooltip } from "antd";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { RootState } from "../../../app/store";
import JobCard from "../../homepage-jobSeeker/components/JobCard";
import { fetchJobDetail } from "../jobDetailSlice";
import {
  addSavedJob,
  fetchSavedJobs,
  removeSavedJob,
} from "../../savedJob-jobSeeker/slice";
import { fetchAppliedJobs } from "../../applyJob-jobSeeker/slices/appliedJobsSlice";
import applyJobService from "../../applyJob-jobSeeker/services";
import jobSeekerCvService from "../../jobSeekerCv/services";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import jobPostService from "../../job/jobPostService";
import type { Job } from "../../../types";
import {
  formatSalaryText,
  getCompanyLogoSrc,
  getJobDetailCached,
} from "../../../utils/jobPostHelpers";
import followService from "../../follow/followService";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import reportService from "../../report/reportService";

const { TextArea } = Input;

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const { job, status, error } = useAppSelector(
    (state: RootState) => state.jobDetail
  );
  const { jobs: savedJobs } = useAppSelector(
    (state: RootState) => state.savedJobs
  );
  const { jobs: appliedJobs } = useAppSelector(
    (state: RootState) => state.appliedJobs
  );
  const jobSeekerId = useAppSelector((state: RootState) => state.auth.user?.id);

  const [isSticky, setIsSticky] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [reportModal, setReportModal] = useState<{
    visible: boolean;
    submitting: boolean;
    reason: string;
    reportType: string;
    customReportType: string;
  }>({
    visible: false,
    submitting: false,
    reason: "",
    reportType: "",
    customReportType: "",
  });

  const navRef = useRef<HTMLDivElement>(null);
  const applyRequestLock = useRef(false);
  const workHoursDisplay = useMemo(() => {
    if (!job) {
      return "";
    }

    const fallback = "Không cập nhật";
    const normalizeSegment = (value?: string | null): string | null => {
      if (!value) {
        return null;
      }
      const trimmed = value.trim();
      if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "null") {
        return null;
      }
      const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!match) {
        return trimmed;
      }
      const hours = match[1].padStart(2, "0");
      const minutes = match[2];
      return `${hours}:${minutes}`;
    };

    const buildRange = (
      startValue?: string | null,
      endValue?: string | null
    ): string | null => {
      const start = normalizeSegment(startValue);
      const end = normalizeSegment(endValue);

      if (start && end) {
        return `${start} - ${end}`;
      }
      if (start) {
        return start;
      }
      if (end) {
        return end;
      }
      return null;
    };

    if (job.workHours) {
      const cleaned = job.workHours.trim();
      if (cleaned && cleaned !== "-") {
        const hyphenParts = cleaned.split("-").map((part) => part?.trim());
        if (hyphenParts.length === 2) {
          const normalized = buildRange(hyphenParts[0], hyphenParts[1]);
          if (normalized) {
            return normalized;
          }
        }
        return cleaned;
      }
    }

    const normalizedFromFields = buildRange(
      job.workHourStart,
      job.workHourEnd
    );
    return normalizedFromFields ?? fallback;
  }, [job]);

  useEffect(() => {
    if (!jobSeekerId) {
      setCvOptions([]);
      return;
    }
    dispatch(fetchSavedJobs(String(jobSeekerId)));
    dispatch(fetchAppliedJobs(Number(jobSeekerId)));

    let isMounted = true;
    const loadCvs = async () => {
      setCvLoading(true);
      try {
        const cvs = await jobSeekerCvService.fetchMyCvs();
        if (isMounted) {
          setCvOptions(cvs);
        }
      } catch (err) {
        message.error("Không thể tải danh sách CV. Vui lòng thử lại sau.");
        console.error("Failed to load CV list", err);
      } finally {
        if (isMounted) {
          setCvLoading(false);
        }
      }
    };

    void loadCvs();

    return () => {
      isMounted = false;
    };
  }, [dispatch, jobSeekerId]);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (
      job &&
      savedJobs.some((savedJob) => savedJob.id === String(job.employerPostId))
    ) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [job, savedJobs]);

  useEffect(() => {
    if (!job || !jobSeekerId) {
      setHasApplied(false);
      setIsFollowing(false);
      return;
    }
    const applied = appliedJobs.some(
      (application) =>
        application.employerPostId === job.employerPostId &&
        application.status?.toLowerCase() !== "withdraw"
    );
    setHasApplied(applied);
  }, [appliedJobs, job, jobSeekerId]);

  useEffect(() => {
    const fetchFollowState = async () => {
      if (!job?.employerId || !jobSeekerId) return;
      try {
        const followed = await followService.checkFollow(
          job.employerId,
          jobSeekerId
        );
        setIsFollowing(followed);
      } catch {
        setIsFollowing(false);
      }
    };
    void fetchFollowState();
  }, [job?.employerId, jobSeekerId]);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!job?.categoryName) {
        setSimilarJobs([]);
        return;
      }
      setSimilarLoading(true);
      try {
        const response = await jobPostService.getAllJobs();
        const allJobs = response.data ?? [];
        const filteredJobs = await Promise.all(
          allJobs
            .filter(
              (post) =>
                post.categoryName === job.categoryName &&
                post.employerPostId !== job.employerPostId
            )
            .slice(0, 5)
            .map(async (post) => {
              const salaryDisplay = formatSalaryText(
                post.salaryMin,
                post.salaryMax,
                post.salaryType,
                post.salaryDisplay
              );

              let logoSource = post.companyLogo;
              if (!logoSource || logoSource.trim().length === 0) {
                const detail = await getJobDetailCached(
                  String(post.employerPostId)
                );
                logoSource = detail?.companyLogo ?? undefined;
              }

              return {
                id: String(post.employerPostId),
                title: post.title,
                description: post.description || "",
                company: post.employerName || null,
                location: post.location || null,
                salary: salaryDisplay,
                updatedAt: post.createdAt,
                companyLogo: getCompanyLogoSrc(logoSource),
                isHot: null,
              };
            })
        );
        setSimilarJobs(filteredJobs);
      } catch (err) {
        console.error("Failed to fetch similar jobs", err);
        setSimilarJobs([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    void fetchSimilarJobs();
  }, [job?.categoryName, job?.employerPostId]);

  useEffect(() => {
    if (cvOptions.length === 0) {
      form.setFieldsValue({ cvId: undefined });
      return;
    }
    const currentCv = form.getFieldValue("cvId");
    if (!currentCv) {
      form.setFieldsValue({ cvId: cvOptions[0].cvid });
    }
  }, [cvOptions, form]);

  const handleSaveToggle = async () => {
    if (!job || !jobSeekerId) {
      message.warning("Vui lòng đăng nhập để thực hiện chức năng này.");
      return;
    }
    const jobId = String(job.employerPostId);

    try {
      if (isSaved) {
        await dispatch(
          removeSavedJob({ jobSeekerId: String(jobSeekerId), jobId })
        ).unwrap();
        message.success("Đã hủy lưu công việc");
        setIsSaved(false);
      } else {
        await dispatch(
          addSavedJob({ jobSeekerId: String(jobSeekerId), jobId })
        ).unwrap();
        message.success("Đã lưu công việc thành công");
        setIsSaved(true);
      }
    } catch (err) {
      message.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Failed to save/unsave the job: ", err);
    }
  };

  const openReportModal = () => {
    if (!jobSeekerId) {
      message.info("Vui lòng đăng nhập để báo cáo công việc.");
      navigate("/login");
      return;
    }
    if (!job) {
      return;
    }
    setReportModal({ visible: true, submitting: false, reason: "", reportType: "", customReportType: "" });
  };

  const submitJobReport = async () => {
    if (!job) {
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
        postId: job.employerPostId,
        affectedPostType: "EmployerPost",
        reportType,
        reason,
      });
      message.success("Đã gửi báo cáo tới quản trị viên.");
      setReportModal({ visible: false, submitting: false, reason: "", reportType: "", customReportType: "" });
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(
        responseMessage ||
          (error instanceof Error ? error.message : "Không thể gửi báo cáo. Vui lòng thử lại.")
      );
      setReportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleApplyNow = () => {
    if (!jobSeekerId) {
      message.warning("Vui lòng đăng nhập để ứng tuyển.");
      navigate("/login");
      return;
    }
    setIsApplyModalVisible(true);
  };

  const refreshJobData = async () => {
    const refreshTasks: Array<Promise<unknown>> = [];

    if (jobSeekerId) {
      refreshTasks.push(
        dispatch(fetchAppliedJobs(Number(jobSeekerId)))
          .unwrap()
          .catch((err) => {
            console.error("Failed to refresh applied jobs", err);
          })
      );
    }

    if (id) {
      refreshTasks.push(
        dispatch(fetchJobDetail(id))
          .unwrap()
          .catch((err) => {
            console.error("Failed to refresh job detail", err);
          })
      );
    }

    if (refreshTasks.length > 0) {
      await Promise.all(refreshTasks);
    }
  };

  const handleApplySuccess = async (successMessage: string) => {
    message.success(successMessage);
    setIsApplyModalVisible(false);
    form.resetFields();
    setHasApplied(true);
    await refreshJobData();
  };

  const extractAxiosErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) {
      return null;
    }
    const data = error.response?.data as
      | { message?: string; error?: string; title?: string }
      | string
      | undefined;
    if (!data) {
      return null;
    }
    if (typeof data === "string") {
      return data;
    }
    if (typeof data.message === "string") {
      return data.message;
    }
    if (typeof data.error === "string") {
      return data.error;
    }
    if (typeof data.title === "string") {
      return data.title;
    }
    return null;
  };

  const isDuplicateApplicationError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    if (error.response?.status === 409) {
      return true;
    }

    const messageText = extractAxiosErrorMessage(error);
    if (!messageText) {
      return false;
    }

    const normalized = messageText
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const duplicateMarkers = ["da ung tuyen", "da nop don", "already applied"];

    return duplicateMarkers.some((marker) => normalized.includes(marker));
  };

  const verifyApplicationRecorded = async (
    employerPostId: number,
    expectedCvId?: number
  ): Promise<boolean> => {
    if (!jobSeekerId) return false;
    const seekerId = jobSeekerId;
    try {
      const response = await applyJobService.getAppliedJobsBySeeker(seekerId);
      const application = response?.data?.find(
        (item) => item.employerPostId === employerPostId
      );
      if (!application) {
        return false;
      }
      const recordedCvId =
        application.cvId ?? application.cvid ?? application.selectedCvId;
      if (
        typeof expectedCvId === "number" &&
        recordedCvId &&
        recordedCvId !== expectedCvId
      ) {
        console.warn(
          "Application recorded with different CV id",
          recordedCvId,
          expectedCvId
        );
      }
      return true;
    } catch (verifyError) {
      console.error("Failed to verify application status", verifyError);
      return false;
    }
  };

  const handleApplySubmit = async (values: { note: string; cvId?: number }) => {
    if (!job || !jobSeekerId) return;
    if (!values.cvId) {
      message.warning("Vui lòng chọn CV để ứng tuyển.");
      return;
    }
    if (applying || applyRequestLock.current) {
      return;
    }

    applyRequestLock.current = true;
    setApplying(true);
    try {
      await applyJobService.applyJob({
        jobSeekerId,
        employerPostId: job.employerPostId,
        cvid: values.cvId,
        note: values.note,
      });
      await handleApplySuccess("Nộp đơn ứng tuyển thành công!");
    } catch (applyError) {
      console.error("Apply failed:", applyError);
      if (isDuplicateApplicationError(applyError)) {
        await handleApplySuccess(
          "Bạn đã nộp đơn công việc này trước đó. Đã cập nhật lại thông tin."
        );
        return;
      }

      const recorded = await verifyApplicationRecorded(
        job.employerPostId,
        values.cvId
      );
      if (recorded) {
        await handleApplySuccess("Nộp đơn ứng tuyển thành công!");
        return;
      }

      message.error("Nộp đơn thất bại. Vui lòng thử lại sau.");
    } finally {
      setApplying(false);
      applyRequestLock.current = false;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const offsetTop = navRef.current.offsetTop;
        setIsSticky(window.scrollY > offsetTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (status === "loading") {
    return <div className="container mx-auto p-4 text-center">Đang tải...</div>;
  }

  if (status === "failed") {
    return (
      <div className="container mx-auto p-4 text-center">Lỗi: {error}</div>
    );
  }

  if (!job) {
    return null;
  }

  const navItems = [
    { id: "tong-quan", label: "Tổng quan" },
    { id: "yeu-cau", label: "Yêu cầu" },
    { id: "chi-tiet", label: "Thông tin" },
  ];

  const salaryDisplay = formatSalaryText(
    job.salaryMin,
    job.salaryMax,
    job.salaryType,
    job.salaryDisplay
  );

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  const requirementLines = job.requirements
    ? job.requirements.split("\n").filter((line) => line.trim())
    : [];

  const quickStats = [
    {
      label: "Mức lương",
      value: salaryDisplay,
      icon: "fas fa-coins",
      accent: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Địa điểm",
      value: job.location || "Không cập nhật",
      icon: "fas fa-map-marker-alt",
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Giờ làm",
      value: workHoursDisplay || "Không cập nhật",
      icon: "fas fa-clock",
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const detailItems: Array<{
    label: string;
    value: string;
    icon: string;
    helper?: string;
  }> = [
    {
      label: "Ngành nghề",
      value: job.categoryName || "Không cập nhật",
      icon: "fas fa-layer-group",
    },
    {
      label: "Liên hệ",
      value: job.phoneContact || "Chưa cung cấp",
      icon: "fas fa-phone-alt",
    },
    {
      label: "Cập nhật",
      value: postedDate,
      icon: "fas fa-calendar-alt",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-50 via-white to-indigo-50">
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="container mx-auto px-4 pt-10 pb-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-blue-100 md:h-20 md:w-20">
                  <img
                    src={job.companyLogo || "/src/assets/no-logo.png"}
                    alt={job.employerName || "Logo"}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                    {job.title}
                  </h1>
                </div>
              </div>

              <div className="flex-1" />
              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <Button
                  type="primary"
                  size="large"
                  className="!bg-gradient-to-r !from-blue-600 !via-sky-600 !to-blue-700 !border-none !shadow-lg hover:!brightness-110"
                  onClick={handleApplyNow}
                  disabled={hasApplied}
                >
                  {hasApplied ? "Đã nộp đơn" : "Nộp đơn ngay"}
                </Button>
                <Button
                  size="large"
                  loading={followLoading}
                  className="!border-blue-100 !text-blue-700 !bg-blue-50 hover:!bg-blue-100 hover:!border-blue-200"
                  onClick={async () => {
                    const employerId = job?.employerId;
                    const seekerId = jobSeekerId ? Number(jobSeekerId) : null;
                    if (!employerId || Number.isNaN(Number(employerId))) {
                      message.error(
                        "Thiếu thông tin nhà tuyển dụng, không thể theo dõi."
                      );
                      return;
                    }
                    if (!seekerId) {
                      message.info(
                        "Vui lòng đăng nhập để theo dõi nhà tuyển dụng."
                      );
                      navigate("/login");
                      return;
                    }
                    setFollowLoading(true);
                    try {
                      if (isFollowing) {
                        await followService.unfollow(
                          Number(employerId),
                          seekerId
                        );
                        setIsFollowing(false);
                        message.success("Đã bỏ theo dõi nhà tuyển dụng.");
                      } else {
                        await followService.follow(Number(employerId), seekerId);
                        setIsFollowing(true);
                        message.success("Đã theo dõi nhà tuyển dụng.");
                      }
                    } catch (followError) {
                      const responseMessage = (followError as { response?: { data?: { message?: string } } })?.response?.data?.message;
                      message.error(
                        responseMessage ||
                          (followError instanceof Error ? followError.message : "KhA'ng th??? c??-p nh??-t theo dA?i.")
                      );
                    } finally {
                      setFollowLoading(false);
                    }
                  }}
                >
                  {isFollowing ? "Bỏ theo dõi" : "Theo dõi nhà tuyển dụng"}
                </Button>
                <Button
                  size="large"
                  className="!border-slate-200 !text-slate-700 hover:!border-red-400"
                  onClick={handleSaveToggle}
                  icon={
                    isSaved ? (
                      <i className="fas fa-heart text-red-500" />
                    ) : (
                      <i className="far fa-heart" />
                    )
                  }
                >
                  {isSaved ? "Đã lưu" : "Lưu tin"}
                </Button>
                <Tooltip title="Báo cáo tin tuyển dụng">
                  <Button
                    size="large"
                    type="text"
                    shape="circle"
                    icon={
                      <ExclamationCircleOutlined
                        style={{ color: "#dc2626", fontSize: 20 }}
                      />
                    }
                    aria-label="Báo cáo tin tuyển dụng"
                    onClick={openReportModal}
                  />
                </Tooltip>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
                <i className="fas fa-calendar-alt text-blue-500" />
                <span>Đăng ngày {postedDate}</span>
              </div>
              {job.categoryName && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">
                  <i className="fas fa-layer-group" />
                  <span>{job.categoryName}</span>
                </div>
              )}
            </div>

            <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg}`}
                  >
                    <i className={`${stat.icon} text-lg ${stat.accent}`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={navRef}
        className={`transition-all duration-300 ${
          isSticky
            ? "fixed left-0 right-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`container mx-auto px-4 pb-12 ${
          isSticky ? "pt-24" : "pt-10"
        }`}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section
              id="tong-quan"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Tổng quan công việc
                </h2>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Mô tả công việc
              </h3>
              <div className="prose max-w-none rounded-xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                {job.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(job.description),
                    }}
                  />
                ) : (
                  <p>Chưa cập nhật mô tả công việc.</p>
                )}
              </div>

              {Array.isArray(job.imageUrls) && job.imageUrls.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Hình ảnh công việc
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {job.imageUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
                        style={{ aspectRatio: "16 / 9" }}
                      >
                        <img
                          src={url}
                          alt={`work-preview-${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section
              id="yeu-cau"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">
                Yêu cầu ứng viên
              </h2>
              <div className="mt-4 space-y-3">
                {requirementLines.length > 0 ? (
                  requirementLines.map((line, index) => (
                    <div
                      key={`${line}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <i className="fas fa-check" />
                      </span>
                      <p className="text-slate-700">
                        {line.replace(/^- /, "")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">Chưa cập nhật yêu cầu.</p>
                )}
              </div>
            </section>

            <section
              id="chi-tiet"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">
                Thông tin chi tiết
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <i className={`${item.icon} text-blue-600`} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        {item.label}
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {item.value}
                      </p>
                      {item.helper && (
                        <p className="text-sm text-slate-600">{item.helper}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  <img
                    src={job.companyLogo || "/src/assets/no-logo.png"}
                    alt={job.employerName}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Nhà tuyển dụng
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">
                    {job.employerName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-emerald-600">
                    <i className="fas fa-check-circle" />
                    <span>Đã xác thực</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt mt-1 text-slate-400" />
                  <span className="flex-1">{job.location}</span>
                </div>
                {job.phoneContact && (
                  <div className="flex items-start gap-3">
                    <i className="fas fa-phone mt-1 text-slate-400" />
                    <span className="flex-1">{job.phoneContact}</span>
                  </div>
                )}
              </div>

              <Link
                to={`/nha-tuyen-dung/chi-tiet/${job.employerId}`}
                className="mt-4 block w-full rounded-xl bg-blue-50 py-2.5 text-center font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                Xem trang công ty{" "}
                <i className="fas fa-external-link-alt text-xs" />
              </Link>
            </Card>

            <Card
              title={
                <span className="font-semibold text-slate-900">
                  Công việc tương tự
                </span>
              }
              className="rounded-2xl border border-slate-100 shadow-sm"
            >
              {similarLoading ? (
                <p>Đang tải công việc tương tự...</p>
              ) : (
                <div className="space-y-4">
                  {similarJobs.length > 0 ? (
                    similarJobs.map((similarJob) => (
                      <JobCard key={similarJob.id} job={similarJob} />
                    ))
                  ) : (
                    <p>Hiện chưa có công việc phù hợp.</p>
                  )}
                </div>
              )}
            </Card>
          </aside>
        </div>
      </div>

      {isSticky && job && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
              <p className="text-sm text-slate-600">{job.employerName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="large"
                onClick={handleSaveToggle}
                className="!border-slate-200 !text-slate-700 hover:!border-blue-500 hover:!text-blue-600"
                icon={
                  isSaved ? (
                    <i className="fas fa-heart text-red-500" />
                  ) : (
                    <i className="far fa-heart" />
                  )
                }
              >
                {isSaved ? "Đã lưu" : "Lưu tin"}
              </Button>
              <Tooltip title="Báo cáo tin tuyển dụng">
                <Button
                  size="large"
                  type="text"
                  shape="circle"
                  icon={
                    <ExclamationCircleOutlined
                      style={{ color: "#dc2626", fontSize: 20 }}
                    />
                  }
                  aria-label="Báo cáo tin tuyển dụng"
                  onClick={openReportModal}
                />
              </Tooltip>
              <Button
                type="primary"
                size="large"
                className="!bg-blue-600 !border-blue-600"
                onClick={handleApplyNow}
                disabled={hasApplied}
              >
                {hasApplied ? "Đã nộp đơn" : "Nộp đơn ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="Báo cáo tin tuyển dụng"
        open={reportModal.visible}
        onCancel={() =>
          setReportModal({ visible: false, submitting: false, reason: "", reportType: "", customReportType: "" })
        }
        onOk={submitJobReport}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={reportModal.submitting}
      >
        <p className="text-sm text-slate-600 mb-3">
          Bạn hãy chia sẻ lý do báo cáo để chúng tôi có thể xử lý tin tuyển dụng
          này nhanh nhất có thể.
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
                setReportModal((prev) => ({ ...prev, customReportType: e.target.value }))
              }
            />
          </div>
        )}
        <TextArea
          rows={4}
          value={reportModal.reason}
          onChange={(e) =>
            setReportModal((prev) => ({ ...prev, reason: e.target.value }))
          }
          placeholder="Ví dụ: Tin đăng có dấu hiệu lừa đảo, nội dung không phù hợp..."
        />
      </Modal>

      <Modal
        title={`Ứng tuyển: ${job.title}`}
        open={isApplyModalVisible}
        onCancel={() => setIsApplyModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApplySubmit}
          initialValues={{ note: "", cvId: undefined }}
        >
          <Form.Item name="note" label="Lời nhắn đến nhà tuyển dụng">
            <TextArea
              rows={4}
              placeholder="Viết một vài điều về bạn hoặc lý do bạn phù hợp với vị trí này."
            />
          </Form.Item>

          <Form.Item
            name="cvId"
            label="Chọn CV của bạn"
            rules={[
              { required: true, message: "Vui lòng chọn một CV để ứng tuyển!" },
            ]}
          >
            <Select
              placeholder="Chọn CV"
              loading={cvLoading}
              disabled={cvOptions.length === 0}
            >
              {cvOptions.map((cv) => (
                <Select.Option key={cv.cvid} value={cv.cvid}>
                  {cv.cvTitle || `CV #${cv.cvid}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {cvOptions.length === 0 && (
            <p className="mb-4 text-sm text-slate-500">
              Bạn chưa có CV nào.{" "}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => {
                  setIsApplyModalVisible(false);
                  navigate("/cv-cua-toi");
                }}
              >
                Tạo CV ngay
              </button>
              .
            </p>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={applying}
              block
              disabled={cvOptions.length === 0}
            >
              Xác nhận ứng tuyển
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobDetailPage;
