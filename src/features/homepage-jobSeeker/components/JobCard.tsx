import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addSavedJob, removeSavedJob, fetchSavedJobs } from '../../savedJob-jobSeeker/slice';
import { formatTimeAgo } from '../../../utils/date';
import type { Job } from '../../../types';
import NoLogo from '../../../assets/no-logo.png';

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
      const alreadySaved = savedJobs.some((savedJob) => savedJob.id === job.id);
      setIsSaved(alreadySaved);
    } else {
      setIsSaved(false);
    }
  }, [job.id, savedJobs, user]);

  useEffect(() => {
    if (user?.id && savedJobs.length === 0) {
      dispatch(fetchSavedJobs(String(user.id))).catch(() => undefined);
    }
  }, [dispatch, savedJobs.length, user?.id]);


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
      className="bg-white p-4 rounded-2xl shadow-sm flex items-start space-x-4 relative w-full border border-gray-200 h-44 cursor-pointer hover:shadow-md hover:border-green-300 transition"
      onClick={handleClick}
    >
      <div className="w-20 flex flex-col items-start gap-2">
        <img
          src={job.companyLogo || NoLogo}
          alt="company logo"
          className="w-16 h-16 object-contain rounded-xl border border-gray-200 p-2 bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).src = NoLogo;
          }}
        />
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm text-slate-800">
            <i className="fas fa-money-bill-wave text-emerald-600" />
            <span className="whitespace-nowrap font-medium">{job.salary}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm text-slate-800">
            <i className="fas fa-map-marker-alt text-blue-600" />
            <span className="truncate max-w-[6rem] font-medium">{job.location}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-start mb-1">
          <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 pr-10">
            {job.title}
          </h3>
          {user && (
            <button
              className={`absolute top-2 right-2 w-9 h-9 rounded-full border ${
                isSaved ? 'border-green-500 text-green-600' : 'border-green-300 text-green-600'
              } flex items-center justify-center hover:border-green-500 transition`}
              onClick={handleSaveToggle}
              type="button"
            >
              <i className={`${isSaved ? 'fas' : 'far'} fa-heart`}></i>
            </button>
          )}
        </div>

        <p className="text-slate-600 text-sm uppercase tracking-wide truncate mt-1">{job.company}</p>
      </div>
    </div>
  );
};

export default JobCard;
