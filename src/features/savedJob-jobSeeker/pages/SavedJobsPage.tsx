import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import { fetchSavedJobs, removeSavedJob } from '../slice';
import SavedJobCard from '../components/SavedJobCard';
import { Pagination, Modal, message } from 'antd';

const SavedJobsPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobs, status, error, total } = useSelector((state: RootState) => state.savedJobs);
  const jobSeekerId = useSelector((state: RootState) => state.auth.user?.id);

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const pageSize = 5;

  const fetchJobs = useCallback(() => {
    if (jobSeekerId !== undefined && jobSeekerId !== null) {
      dispatch(fetchSavedJobs(String(jobSeekerId)));
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
    if (jobToDelete && jobSeekerId !== undefined && jobSeekerId !== null) {
      try {
        await dispatch(removeSavedJob({ jobId: jobToDelete, jobSeekerId: String(jobSeekerId) })).unwrap();
        message.success('Xóa công việc đã lưu thành công!');
        // Optionally, re-fetch the list if the slice doesn't handle removal automatically
        // fetchJobs();
      } catch {
        message.error('Xóa công việc thất bại. Vui lòng thử lại.');
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Công việc đã lưu ({total})</h1>
      
      {status === 'loading' && <p>Đang tải...</p>}
      {status === 'failed' && <p className="text-red-500">{error}</p>}
      
      {status === 'succeeded' && (
        <div className="max-w-4xl mx-auto">
          {currentJobs.length > 0 ? (
            <div className="space-y-4">
              {currentJobs.map(job => (
                <SavedJobCard key={job.id} job={job} onDelete={showDeleteConfirm} />
              ))}
            </div>
          ) : (
            <p>Bạn chưa lưu công việc nào.</p>
          )}
          {total > 0 && (
            <div className="flex justify-center mt-6">
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
      )}
      <Modal
        title="Xác nhận xóa"
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa công việc đã lưu này không?</p>
      </Modal>
    </div>
  );
};

export default SavedJobsPage;
