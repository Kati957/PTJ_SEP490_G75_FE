import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../../utils/date';
import type { SavedJob } from '../types';

interface SavedJobCardProps {
  job: SavedJob;
  onDelete: (jobId: string) => void; // Hàm xử lý xóa
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/viec-lam/chi-tiet/${job.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click của card
    onDelete(job.id);
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4 relative w-full border border-gray-200 h-40 cursor-pointer"
      onClick={handleClick}
    >
      {/* Icon trái tim cho biết đã lưu */}
      <div className="absolute top-4 left-4 text-blue-600">
        <i className="fas fa-heart"></i>
      </div>

      <img src={job.companyLogo || "/src/assets/no-logo.png"} alt="company logo" className="w-16 h-16 object-contain ml-8" />
      
      <div className="flex-1 overflow-hidden">
        <h3 className="text-base font-semibold text-gray-800 truncate pr-6">
          {job.title}
        </h3>
        <p className="text-gray-600 text-sm truncate">{job.company}</p>
        
        <div className="flex items-center text-indigo-500 text-xs mt-2">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center text-red-600 text-xs mt-2">
          <i className="fas fa-money-bill-wave mr-1"></i>
          <span>{job.salary}</span>
        </div>

        {/* Nút xóa */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
          onClick={handleDelete}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
        
        {/* Hiển thị ngày đã lưu */}
        <span className="text-gray-500 text-xs absolute bottom-4 right-4">
          Đã lưu {formatTimeAgo(job.savedAt)}
        </span>
      </div>
    </div>
  );
};

export default SavedJobCard;
