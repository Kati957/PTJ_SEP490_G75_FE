import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchSavedJobs, removeSavedJob } from "../slice";
import SavedJobCard from "../components/SavedJobCard";
import { Pagination, Modal, message, Spin, Empty, Alert, Button } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const SavedJobsPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobs, status, error, total } = useSelector(
    (state: RootState) => state.savedJobs
  );
  const jobSeekerId = useSelector(
    (state: RootState) => state.auth.user?.id
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const pageSize = 6;

  const fetchJobs = useCallback(() => {
    if (jobSeekerId) {
      dispatch(fetchSavedJobs(jobSeekerId));
    }
  }, [dispatch, jobSeekerId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const showDeleteConfirm = (jobId: string) => {
    setJobToDelete(jobId);
    setIsModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete && jobSeekerId) {
      try {
        await dispatch(
          removeSavedJob({ jobId: jobToDelete, jobSeekerId })
        ).unwrap();
        message.success("Đã xoá công việc khỏi danh sách lưu");
      } catch (err) {
        message.error("Xoá công việc thất bại. Thử lại.");
      }
    }
    setIsModalVisible(false);
    setJobToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsModalVisible(false);
    setJobToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="py-12 flex justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (status === "failed") {
      return (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      );
    }

    if (currentJobs.length === 0) {
      return (
        <div className="py-12 flex flex-col items-center gap-4">
          <Empty description="Bạn chưa lưu công việc nào" />
          <Link to="/viec-lam">
            <Button type="primary">Tìm việc ngay</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {currentJobs.map((job) => (
          <SavedJobCard key={job.id} job={job} onDelete={showDeleteConfirm} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-gradient-to-r from-emerald-600 to-sky-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <HeartFilled className="text-2xl" />
            <p className="text-sm uppercase tracking-wide text-emerald-100">
              Việc làm đã lưu
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Danh sách việc làm yêu thích
          </h1>
          <p className="text-emerald-50 max-w-2xl">
            Quay lại nhanh các cơ hội bạn đã lưu, so sánh và ứng tuyển khi sẵn sàng.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">
          {renderContent()}
          {total > pageSize && (
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Xoá công việc đã lưu?"
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn chắc chắn muốn xoá công việc này khỏi danh sách đã lưu?</p>
      </Modal>
    </div>
  );
};

export default SavedJobsPage;
