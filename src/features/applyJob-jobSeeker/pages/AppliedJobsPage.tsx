import React, { useEffect } from "react";
import { Alert, message, Spin, Typography, Button } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import type { RootState } from "../../../app/store";
import AppliedJobCard from "../components/AppliedJobCard";
import {
  fetchAppliedJobs,
  withdrawApplication,
} from "../slices/appliedJobsSlice";

const { Title } = Typography;

const AppliedJobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id: jobSeekerId } =
    useAppSelector((state: RootState) => state.auth.user) || {};
  const { jobs, status, error } = useAppSelector(
    (state: RootState) => state.appliedJobs
  );

  useEffect(() => {
    if (jobSeekerId) {
      dispatch(fetchAppliedJobs(jobSeekerId));
    }
  }, [dispatch, jobSeekerId]);

  const handleWithdraw = async (
    jobSeekerId: number,
    employerPostId: number
  ) => {
    try {
      await dispatch(
        withdrawApplication({ jobSeekerId, employerPostId })
      ).unwrap();
      message.success("Rút đơn thành công");
      dispatch(fetchAppliedJobs(jobSeekerId));
    } catch (err) {
      message.error("Rút đơn thất bại. Thử lại.");
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (status === "failed") {
      return (
        <Alert
          message="Lỗi"
          description={error || "Không thể tải danh sách công việc."}
          type="error"
          showIcon
        />
      );
    }

    if (status === "succeeded" && jobs.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderOpenOutlined className="text-4xl text-slate-400 mb-3" />
          <Title level={4}>Bạn chưa ứng tuyển công việc nào.</Title>
          <p className="text-slate-600">
            Bắt đầu tìm kiếm và ứng tuyển những công việc phù hợp!
          </p>
          <Button type="primary" className="mt-4" href="/viec-lam">
            Tìm việc ngay
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {jobs.map((appliedJob) => (
          <AppliedJobCard
            key={appliedJob.candidateListId}
            appliedJob={appliedJob}
            onWithdraw={handleWithdraw}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p className="text-sm uppercase tracking-widest text-indigo-100">
            Công việc đã ứng tuyển
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Theo dõi trạng thái ứng tuyển
          </h1>
          <p className="text-indigo-50 mt-2">
            Quản lý các cơ hội bạn đã nộp đơn và rút đơn khi cần.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AppliedJobsPage;
