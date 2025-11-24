import React, { useEffect, useState } from "react";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import { Spin, Typography, Badge, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";

const { Text } = Typography;

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeJobs, setActiveJobs] = useState<JobPostView[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [recentApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await jobPostService.getJobsByUser(user.id);
        if (res.success && res.data) {
          const active = res.data.filter((job) => job.status.toLowerCase() === "active");
          setActiveJobs(active);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách công việc:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    const fetchApps = async () => {
      setLoadingApps(true);
      // TODO: khi có service ứng viên, gọi API lấy ứng viên mới tại đây.
      setLoadingApps(false);
    };

    fetchJobs();
    fetchApps();
  }, [user]);

  const heroStats = [
    { label: "Công việc đang chạy", value: loadingJobs ? "..." : activeJobs.length },
    { label: "Ứng viên mới", value: loadingApps ? "..." : recentApps.length },
    { label: "Chiến dịch tuyển dụng", value: "Sắp ra mắt" },
  ];

  const cleanDescription = (html?: string | null) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .trim();
  };

  const formatSalary = (job: JobPostView) => {
    if (job.salaryText) return job.salaryText;
    if (job.salary && job.salary > 0) {
      return `${job.salary.toLocaleString("vi-VN")} VND`;
    }
    return "Thỏa thuận";
  };

  const formatRelativeDate = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Cập nhật hôm nay";
    if (days === 1) return "Cập nhật 1 ngày trước";
    return `Cập nhật ${days} ngày trước`;
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-blue-700 text-white shadow-lg">
        <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">TopCV for Business</p>
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
              Đăng tin tuyển dụng miễn phí, tìm CV ứng viên <span className="text-emerald-100">nhanh hơn</span>
            </h1>
            <p className="text-white/80 text-base max-w-2xl">
              Tiếp cận kho ứng viên chất lượng, quản lý chiến dịch tuyển dụng và theo dõi CV trong một giao diện thống nhất.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 bg-white text-sky-700 font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
                onClick={() => navigate("/nha-tuyen-dung/dang-tin")}
              >
                Đăng tin ngay
              </button>
              <button
                className="inline-flex items-center gap-2 border border-white/70 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition"
                onClick={() => navigate("/nha-tuyen-dung/cong-viec")}
              >
                Quản lý tin tuyển dụng
              </button>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 lg:p-6 backdrop-blur shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/70">Tổng quan</p>
                <p className="text-xl font-semibold">Hiệu suất tuyển dụng</p>
              </div>
              <Badge count={activeJobs.length} style={{ backgroundColor: "#0ea5e9" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {heroStats.map((item) => (
                <div key={item.label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-white/80 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-white/80">
              <span>Quản lý chiến dịch tuyển dụng</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-xs">
                Mới
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Bài tuyển dụng đang hoạt động</h2>
            <button
              onClick={() => navigate("/nha-tuyen-dung/dang-tin")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 font-medium transition"
            >
              <PlusOutlined /> Tạo bài đăng tuyển mới
            </button>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-10 text-gray-500">
              <Spin />
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>Chưa có công việc nào đang chạy. Hãy đăng bài viết đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 4).map((job) => (
                <div
                  key={job.employerPostId}
                  className="p-4 border border-slate-100 rounded-xl hover:border-sky-200 hover:shadow transition cursor-pointer relative pl-5"
                  style={{ boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)" }}
                  onClick={() => {
                    setSelectedJob(job);
                    setIsModalVisible(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedJob(job);
                      setIsModalVisible(true);
                    }
                  }}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-sky-400/80" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sky-700 text-base">{job.title}</p>
                        <Tag color="blue-inverse" className="rounded-full px-3 py-1 text-xs">
                          Đang hoạt động
                        </Tag>
                      </div>
                      <p className="text-sm text-slate-600">
                        {job.employerName || "Nhà tuyển dụng"} • {formatSalary(job)}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <Tag className="bg-slate-100 border-slate-200 text-slate-700 rounded-full px-3 py-1">
                          {job.location || "Chưa cập nhật địa điểm"}
                        </Tag>
                        {job.categoryName && (
                          <Tag className="bg-slate-100 border-slate-200 text-slate-700 rounded-full px-3 py-1">
                            {job.categoryName}
                          </Tag>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-slate-700">
                          {(() => {
                            const plain = cleanDescription(job.description);
                            return plain.length > 100 ? `${plain.slice(0, 100)}...` : plain;
                          })()}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">{formatRelativeDate(job.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Ứng viên mới</h3>
            <FileTextOutlined className="text-sky-500" />
          </div>
          {loadingApps ? (
            <div className="text-center text-gray-500 py-8">
              <Spin />
            </div>
          ) : recentApps.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Chưa có ứng viên mới.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3 border border-slate-100 rounded-lg">
                  <Text strong>{app.candidateName}</Text>
                  <Text type="secondary" className="block">
                    Ứng tuyển: {app.jobTitle}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <JobPostDetailModal
        jobPost={selectedJob}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
};

export default EmployerDashboard;
