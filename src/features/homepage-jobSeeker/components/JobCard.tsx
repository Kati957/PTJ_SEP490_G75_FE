import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addSavedJob, removeSavedJob, fetchSavedJobs } from '../../savedJob-jobSeeker/slice';
import { formatTimeAgo } from '../../../utils/date';
import type { Job } from '../../../types';
import defaultLogo from '../../../assets/no-logo.png';

interface JobCardProps {
  job: Job;
  tone?: 'white' | 'gray';
}

const JobCard: React.FC<JobCardProps> = ({ job, tone = 'white' }) => {
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

  const seekerId = String(jobSeekerId);
  const action = isSaved ? removeSavedJob({ jobSeekerId: seekerId, jobId }) : addSavedJob({ jobSeekerId: seekerId, jobId });

    dispatch(action)
      .unwrap()
      .then(() => {
        const successMessage = isSaved ? 'Đã bỏ lưu công việc.' : 'Đã lưu công việc thành công!';
        message.success(successMessage);
        setIsSaved(!isSaved); 

        if (!isSaved) {
          dispatch(fetchSavedJobs(seekerId));
        }
      })
      .catch((error) => {
        console.error('Failed to update saved job status:', error);
        message.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      });
  };

  return (
    <div
      className={`${tone === 'gray' ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'} px-3 py-3 rounded-2xl shadow-sm flex items-start relative w-full border cursor-pointer transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_10px_30px_rgba(59,130,246,0.12)] hover:bg-blue-50/20 group`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4 flex-1">
        <img src={job.companyLogo || defaultLogo} alt="company logo" className="w-16 h-16 object-contain rounded-xl border border-blue-50 p-1 bg-white" />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-start mb-1 pr-10">
            <h3
              className="text-base font-semibold text-slate-900 leading-snug"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {job.title}
            </h3>
            {user && (
              <button
                className={`absolute top-2 right-2 text-slate-400 hover:text-red-500 ${isSaved ? 'text-red-500' : ''} bg-white/90 rounded-full p-2 shadow-sm`}
                onClick={handleSaveToggle}
                aria-label={isSaved ? 'Bỏ lưu công việc' : 'Lưu công việc'}
              >
                <i className={`${isSaved ? 'fas' : 'far'} fa-heart`}></i>
              </button>
            )}
          </div>
          
          <p
            className="text-slate-500 text-sm leading-snug"
            style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {job.company}
          </p>
          
          <div className="flex items-center text-blue-600 text-xs mt-2">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center text-emerald-600 text-xs mt-2">
            <i className="fas fa-money-bill-wave mr-1"></i>
            <span>{job.salary}</span>
          </div>
        </div>
      </div>

      {(job.matchPercent != null || job.updatedAt) && (
        <div className="flex flex-col items-center justify-between min-w-[90px] h-full py-1">
          {job.matchPercent != null && (
            <div className="relative w-12 h-12">
              {(() => {
                const radius = 20;
                const circumference = 2 * Math.PI * radius;
                const percent = Math.max(0, Math.min(100, Math.round(job.matchPercent ?? 0)));
                const offset = circumference * (1 - percent / 100);
                return (
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r={radius}
                      stroke="#e5e7eb"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r={radius}
                      stroke="#f59e0b"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform="rotate(-90 24 24)"
                    />
                    <text
                      x="24"
                      y="27"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#111827"
                    >
                      {percent}%
                    </text>
                  </svg>
                );
              })()}
              <div className="mt-1 text-[11px] text-slate-500 font-medium text-center">Độ phù hợp</div>
            </div>
          )}
          {job.updatedAt && (
            <span className="text-slate-400 text-xs whitespace-nowrap absolute bottom-2 right-3">
              {formatTimeAgo(job.updatedAt)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
