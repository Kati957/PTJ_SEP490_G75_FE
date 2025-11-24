import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, message, Modal, Form, Input, Select } from "antd";
import DOMPurify from "dompurify";
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
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const applyRequestLock = useRef(false);

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
    const fetchSimilarJobs = async () => {
      if (!job?.categoryName) {
        setSimilarJobs([]);
        return;
      }
      setSimilarLoading(true);
      try {
        const response = await jobPostService.getAllJobs();
        const allJobs = response.data ?? [];
        const filteredJobs = allJobs
          .filter(
            (post) =>
              post.categoryName === job.categoryName &&
              post.employerPostId !== job.employerPostId
          )
          .slice(0, 5)
          .map((post) => ({
            id: String(post.employerPostId),
            title: post.title,
            description: post.description || "",
            company: post.employerName || null,
            location: post.location || null,
            salary:
              post.salaryText ||
              (typeof post.salary === "number"
                ? `${post.salary.toLocaleString()} VNĐ`
                : null),
            updatedAt: post.createdAt,
            companyLogo: post.companyLogo || null,
            isHot: null,
          }));
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

  const handleApplyNow = () => {
    if (!jobSeekerId) {
      message.warning("Vui lòng đăng nhập để ứng tuyển.");
      navigate("/login"); // Redirect to login page
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

  const handleApplySubmit = async (values: { note: string; cvId?: number }) => {
    if (!job || !jobSeekerId) return;
    if (!values.cvId) {
      message.warning("Vui long chon CV de ung tuyen.");
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
      await handleApplySuccess("Nop don ung tuyen thanh cong!");
    } catch (error) {
      console.error("Apply failed:", error);
      if (isDuplicateApplicationError(error)) {
        await handleApplySuccess(
          "Ban da nop don cong viec nay truoc do. Da cap nhat lai thong tin."
        );
      } else {
        message.error("Nop don that bai. Vui long thu lai sau.");
      }
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

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {/* Job Header */}
          <div className="flex items-start mb-4">
            <img
              src={job.companyLogo || "/src/assets/no-logo.png"}
              alt="company logo"
              className="w-24 h-24 object-contain mr-6"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{job.title}</h1>
              <p className="text-lg text-gray-700 mt-1">{job.employerName}</p>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <i className="fas fa-briefcase mr-2"></i>
                <span>{job.workHours}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đăng: {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <Button
              type="primary"
              size="large"
              className="bg-blue-600"
              onClick={handleApplyNow}
              disabled={hasApplied}
            >
              {hasApplied ? "Đã nộp đơn" : "Nộp đơn ngay"}
            </Button>
            <Button
              size="large"
              onClick={handleSaveToggle}
              icon={
                isSaved ? (
                  <i className="fas fa-heart text-red-500"></i>
                ) : (
                  <i className="far fa-heart"></i>
                )
              }
            >
              {isSaved ? "Đã lưu" : "Lưu"}
            </Button>
          </div>

          {/* Sticky Nav */}
          <div
            ref={navRef}
            className={`bg-white border-b transition-all duration-300 ${
              isSticky ? "fixed top-0 left-0 right-0 shadow-md z-10" : ""
            }`}
          >
            <div className="container mx-auto">
              <nav className="flex space-x-8 p-4">
                {[
                  "Mô tả công việc",
                  "Yêu cầu",
                  "Chi tiết công việc",
                  "Liên hệ",
                ].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.toLowerCase().replace(/ /g, "-"));
                    }}
                    className="text-gray-600 hover:text-blue-600 font-semibold"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Sections */}
          <div id="mô-tả-công-việc" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Mô tả công việc</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(job.description || ""),
              }}
            ></div>
          </div>

          <div id="yêu-cầu" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Yêu cầu ứng viên</h2>
            <ul className="list-disc pl-5 prose max-w-none">
              {job.requirements &&
                job.requirements
                  .split("\n")
                  .map(
                    (line, index) =>
                      line.trim() && (
                        <li key={index}>{line.replace(/^- /, "")}</li>
                      )
                  )}
            </ul>
          </div>

          <div id="chi-tiết-công-việc" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Chi tiết công việc</h2>
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Lương</p>
                  <p>
                    {job.salary
                      ? `${job.salary.toLocaleString()} VNĐ`
                      : "Thương lượng"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Giờ làm việc</p>
                  <p>{job.workHours}</p>
                </div>
                <div>
                  <p className="font-semibold">Ngành nghề</p>
                  <p>{job.categoryName}</p>
                </div>
                <div>
                  <p className="font-semibold">Trạng thái</p>
                  <p>{job.status}</p>
                </div>
              </div>
            </Card>
          </div>

          <div id="liên-hệ" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
            <p>
              <span className="font-semibold">Điện thoại:</span>{" "}
              {job.phoneContact}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Địa chỉ:</span> {job.location}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Employer Info Card */}
          <Card className="shadow-md border-t-4 border-t-blue-600">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1">
                <img
                  src={job.companyLogo || "/src/assets/no-logo.png"}
                  alt={job.employerName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700 mb-1">
                  Nhà tuyển dụng:
                </p>
                <h3 className="font-bold text-base text-gray-800 line-clamp-2 mb-1">
                  {job.employerName}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>Đã xác thực</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <i className="fas fa-map-marker-alt mt-1 text-gray-400 w-4 text-center"></i>
                <span className="flex-1 line-clamp-2">{job.location}</span>
              </div>
              {job.phoneContact && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <i className="fas fa-phone mt-1 text-gray-400 w-4 text-center"></i>
                  <span className="flex-1">{job.phoneContact}</span>
                </div>
              )}
            </div>

            <Link
              to={`/nha-tuyen-dung/chi-tiet/${job.employerId}`}
              className="block w-full text-center py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors duration-300"
            >
              Xem trang công ty{" "}
              <i className="fas fa-external-link-alt ml-1 text-xs"></i>
            </Link>
          </Card>

          {/* Similar Jobs Card */}
          <Card title="Việc làm tương tự">
            {similarLoading ? (
              <p>Đang tải việc làm tương tự...</p>
            ) : (
              <div className="space-y-4">
                {similarJobs.length > 0 ? (
                  similarJobs.map((similarJob) => (
                    <JobCard key={similarJob.id} job={similarJob} />
                  ))
                ) : (
                  <p>Hiện chưa có.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky Apply/Save Popup */}
      {isSticky && job && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-10 border-t">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.employerName}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                size="large"
                onClick={handleSaveToggle}
                icon={
                  isSaved ? (
                    <i className="fas fa-heart text-red-500"></i>
                  ) : (
                    <i className="far fa-heart"></i>
                  )
                }
              >
                {isSaved ? "Đã lưu" : "Lưu"}
              </Button>
              <Button
                type="primary"
                size="large"
                className="bg-blue-600"
                onClick={handleApplyNow}
                disabled={hasApplied}
              >
                {hasApplied ? "Đã nộp đơn" : "Nộp đơn ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Job Modal */}
      <Modal
        title={`Ứng tuyển: ${job.title}`}
        visible={isApplyModalVisible}
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
              placeholder="Viết một vài điều về bản thân hoặc tại sao bạn nghĩ mình phù hợp với vị trí này."
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
            <p className="text-sm text-gray-500 mb-4">
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
