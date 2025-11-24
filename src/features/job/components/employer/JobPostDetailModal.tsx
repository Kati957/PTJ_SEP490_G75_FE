import React, { useEffect, useState } from "react";
import { Modal, Button, List, Tag, Spin } from "antd";
import { EnvironmentOutlined, PhoneOutlined } from "@ant-design/icons";
import { JobDetailView } from "./JobDetailView";
import type { JobPostView } from "../../jobTypes";
import { jobApplicationService } from "../../../applyJob-employer/jobApplicationService";
import type { JobApplicationResultDto } from "../../../applyJob-jobSeeker/type";

interface Props {
  jobPost: JobPostView | null;
  visible: boolean;
  onClose: () => void;
}

const JobPostDetailModal: React.FC<Props> = ({ jobPost, visible, onClose }) => {
  const [candidates, setCandidates] = useState<JobApplicationResultDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobPost) {
        setCandidates([]);
        return;
      }
      setLoading(true);
      try {
        const res = await jobApplicationService.getApplicationsByPost(
          jobPost.employerPostId
        );
        if (res.success) {
          setCandidates(res.data);
        } else {
          setCandidates([]);
        }
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobPost]);

  const renderStatus = (status?: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "accepted") return <Tag color="success">Đã duyệt</Tag>;
    if (normalized === "rejected") return <Tag color="error">Đã từ chối</Tag>;
    if (normalized === "pending") return <Tag color="processing">Chờ duyệt</Tag>;
    return <Tag>Chưa xem</Tag>;
  };

  return (
    <Modal
      title={jobPost?.title || "Chi tiết công việc"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1280}
      bodyStyle={{ padding: 24 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {jobPost && <JobDetailView job={jobPost} />}
        </div>

        <div className="lg:col-span-2">
          <div className="text-lg font-semibold text-indigo-600 mb-4">
            Ứng viên đã nộp ({candidates.length})
          </div>
          <Spin spinning={loading}>
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 h-full">
              <List
                dataSource={candidates}
                locale={{ emptyText: "Chưa có ứng viên nào" }}
                split
                renderItem={(item) => (
                  <List.Item className="p-3 rounded-lg hover:bg-white transition-colors">
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            Nộp ngày:{" "}
                            {item.applicationDate
                              ? new Date(item.applicationDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </div>
                        </div>
                        {renderStatus(item.status)}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <EnvironmentOutlined className="text-gray-400 mt-0.5" />
                        <span>{item.location || "Chưa cập nhật địa điểm"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneOutlined className="text-gray-400" />
                        <span>
                          Liên hệ:{" "}
                          <span className="font-semibold">
                            {item.phoneContact || "N/A"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Spin>
        </div>
      </div>
    </Modal>
  );
};

export { JobPostDetailModal };
