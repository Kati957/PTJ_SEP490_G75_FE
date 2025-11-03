import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import { fetchSavedJobs, removeSavedJob } from '../slice';
import SavedJobCard from '../components/SavedJobCard';

const SavedJobsPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobs, status, error } = useSelector((state: RootState) => state.savedJobs);

  useEffect(() => {
    // Chỉ fetch dữ liệu nếu trạng thái là idle
    if (status === 'idle') {
      dispatch(fetchSavedJobs());
    }
  }, [status, dispatch]);

  const handleDelete = (jobId: string) => {
    // Dispatch action để xóa công việc
    dispatch(removeSavedJob(jobId));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Công việc đã lưu ({jobs.length})</h1>
      
      {status === 'loading' && <p>Đang tải...</p>}
      {status === 'failed' && <p className="text-red-500">{error}</p>}
      
      {status === 'succeeded' && (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <SavedJobCard key={job.id} job={job} onDelete={handleDelete} />
            ))
          ) : (
            <p>Bạn chưa lưu công việc nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
