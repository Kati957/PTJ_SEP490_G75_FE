import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addSavedJob, removeSavedJob, fetchSavedJobs } from '../../savedJob-jobSeeker/slice';
import { formatTimeAgo } from '../../../utils/date';
import type { Job } from '../../../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { jobs: savedJobs } = useAppSelector((state) => state.savedJobs);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const alreadySaved = savedJobs.some(savedJob => savedJob.id === job.id);
      setIsSaved(alreadySaved);
    } else {
      setIsSaved(false);
    }
  }, [job.id, savedJobs, user]);


  const handleClick = () => {
    navigate(`/viec-lam/chi-tiet/${job.id}`);
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      message.error('Bạn cần đăng nhập để thực hiện chức năng này.');
      navigate('/login');
      return;
    }

    const jobSeekerId = user.id;
    const jobId = job.id;

    const action = isSaved ? removeSavedJob({ jobSeekerId, jobId }) : addSavedJob({ jobSeekerId, jobId });

    dispatch(action)
      .unwrap()
      .then(() => {
        const successMessage = isSaved ? 'Đã bỏ lưu công việc.' : 'Đã lưu công việc thành công!';
        message.success(successMessage);
        setIsSaved(!isSaved); 

        if (!isSaved) {
          dispatch(fetchSavedJobs(jobSeekerId));
        }
      })
      .catch((error) => {
        console.error('Failed to update saved job status:', error);
        message.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      });
  };

  return (
    <div
      className="bg-white p-4 rounded-2xl shadow-md flex items-start space-x-4 relative w-full border border-gray-200 h-44 cursor-pointer hover:-translate-y-1 transition"
      onClick={handleClick}
    >
      <img src={job.companyLogo || "/src/assets/no-logo.png"} alt="company logo" className="w-16 h-16 object-contain rounded-xl border border-blue-50 p-1 bg-white" />
      <div className="flex-1 overflow-hidden">
        <div className="flex items-start mb-1">
          <h3 className="text-base font-semibold text-slate-900 truncate pr-6">
            {job.isHot && <span className="bg-sky-100 text-sky-600 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">HOT</span>}
            {job.title}
          </h3>
          {user && (
            <button
              className={`absolute top-4 right-4 text-slate-400 hover:text-red-500 ${isSaved ? 'text-red-500' : ''}`}
              onClick={handleSaveToggle}
            >
              <i className={`${isSaved ? 'fas' : 'far'} fa-heart`}></i>
            </button>
          )}
        </div>
        
        <p className="text-slate-500 text-sm truncate">{job.company}</p>
        
        <div className="flex items-center text-blue-600 text-xs mt-2">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center text-emerald-600 text-xs mt-2">
          <i className="fas fa-money-bill-wave mr-1"></i>
          <span>{job.salary}</span>
        </div>
        
        <span className="text-slate-400 text-xs absolute bottom-4 right-4">
          {formatTimeAgo(job.updatedAt)}
        </span>
      </div>
    </div>
  );
};

export default JobCard;
