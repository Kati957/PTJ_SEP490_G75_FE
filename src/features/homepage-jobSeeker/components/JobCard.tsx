import React from 'react';
import { useNavigate } from 'react-router-dom';

import { formatTimeAgo } from '../../../utils/date';
import type { Job } from '../../../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/viec-lam/chi-tiet/${job.id}`);
  };

  return (
    // Giữ nguyên các class h-40 để cố định chiều cao
    <div
      className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4 relative w-full border border-gray-200 h-40 cursor-pointer"
      onClick={handleClick}
    >
      <img src={job.companyLogo || "/src/assets/no-logo.png"} alt="company logo" className="w-16 h-16 object-contain" /> {/* Sử dụng companyLogo */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-start mb-1">
          <h3 className="text-base font-semibold text-gray-800 truncate pr-6">
            {job.isHot && <span className="bg-orange-100 text-orange-500 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">HOT</span>} {/* Hiển thị HOT nếu isHot là true */}
            {job.title}
          </h3>
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              // Add to favorites logic here
              console.log('Add to favorites', job.id);
            }}
          >
            <i className="far fa-heart"></i>
          </button>
        </div>
        
        <p className="text-gray-600 text-sm truncate">{job.company}</p>
        
        <div className="flex items-center text-indigo-500 text-xs mt-2">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center text-red-600 text-xs mt-2">
          <i className="fas fa-money-bill-wave mr-1"></i>
          <span>{job.salary}</span>
        </div>
        
        {/* 2. Sử dụng hàm formatTimeAgo với prop job.updatedAt */}
        <span className="text-gray-500 text-xs absolute bottom-4 right-4">
          {formatTimeAgo(job.updatedAt)}
        </span>
      </div>
    </div>
  );
};

export default JobCard;