import React, { useEffect, useState } from "react";
import { StatCard } from "../../components/employer/StatCard";
import {
  BellOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";

// ---
// GHI CHÚ QUAN TRỌNG:
// File 'jobApplicationService.ts' bạn cung cấp
// không có hàm lấy TẤT CẢ đơn ứng tuyển theo nhà tuyển dụng (chỉ có hàm lấy theo từng bài đăng).
// Do đó, phần "Đơn ứng tuyển gần đây" chưa thể điền dữ liệu.
// ---

const { Text } = Typography;

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeJobs, setActiveJobs] = useState<JobPostView[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [recentApps, setRecentApps] = useState<any[]>([]);
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
          const active = res.data.filter(
            (job) => job.status.toLowerCase() === "active"
          );
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
      // Khi có service, bạn sẽ gọi ở đây:
      // try {
      //   const res = await jobApplicationService.getRecentAppsByEmployer(user.id);
      //   if (res.success) setRecentApps(res.data);
      // } catch (error) { ... }
      // finally { setLoadingApps(false); }

      // Vì chưa có service, chúng ta giữ trạng thái loading = false
      setLoadingApps(false);
    };

    fetchJobs();
    fetchApps();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My CareerLink</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Yêu cầu hủy cấp hồ sơ"
          value={0}
          icon={<BellOutlined />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Việc đang kích hoạt"
          value={loadingJobs ? <Spin size="small" /> : activeJobs.length}
          icon={<CheckCircleOutlined />}
        />
        <StatCard
          title="Thư xin việc gần đây"
          value={loadingApps ? <Spin size="small" /> : recentApps.length}
          icon={<FileTextOutlined />}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Đơn ứng tuyển gần đây
          </h2>
          <a href="/nha-tuyen-dung/cong-viec" className="text-sm text-blue-600 hover:underline">
            Xem tất cả →
          </a>
        </div>

        {loadingApps ? (
          <div className="text-center text-gray-500 py-10">
            <Spin />
          </div>
        ) : recentApps.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p>Bạn không có thư xin việc nào phù hợp</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApps.slice(0, 3).map((app) => (
              <div key={app.id} className="p-3 border rounded-md">
                <Text strong>{app.candidateName}</Text>
                <Text type="secondary" block>
                  Đã ứng tuyển vào: {app.jobTitle}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Công việc đang kích hoạt
          </h2>

          <button
            onClick={() => navigate("/nha-tuyen-dung/cong-viec")}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Xem tất cả {loadingJobs ? "(...)" : `(${activeJobs.length})`} →
          </button>
        </div>

        {loadingJobs ? (
          <div className="flex justify-center py-10 text-gray-500">
            <Spin />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Không có công việc nào đang được kích hoạt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.slice(0, 3).map((job) => (
              <div
                key={job.employerPostId}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow transition-all cursor-pointer"
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
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-blue-600 text-base">
                      {job.title}
                    </p>

                    <p className="text-gray-500 text-sm mt-1">
                      {job.location || "Chưa cập nhật địa điểm"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
