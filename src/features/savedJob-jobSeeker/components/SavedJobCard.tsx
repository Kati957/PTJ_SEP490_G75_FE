import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../../../utils/date";
import type { SavedJob } from "../types";
import noLogo from "../../../assets/no-logo.png";

interface SavedJobCardProps {
  job: SavedJob;
  onDelete: (jobId: string) => void;
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/viec-lam/chi-tiet/${job.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(job.id);
  };

  const logoSrc =
    job.companyLogo ||
    (job as any).logo ||
    (job as any).logoUrl ||
    noLogo;

  return (
    <div
      className="bg-white p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-md flex gap-4 relative w-full border border-slate-100 cursor-pointer transition"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <img
          src={logoSrc}
          alt="company logo"
          className="w-16 h-16 rounded-xl object-cover border border-slate-100"
        />
      </div>

      <div className="flex-1 overflow-hidden space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
              {job.title}
            </h3>
            <p className="text-slate-600 text-sm truncate">{job.company}</p>
          </div>
          <button
            className="text-slate-400 hover:text-red-500"
            onClick={handleDelete}
            aria-label="Xóa công việc đã lưu"
          >
            <i className="fas fa-trash-alt" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs md:text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50">
            <i className="fas fa-map-marker-alt text-emerald-500" />
            {job.location || "Đang cập nhật"}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            <i className="fas fa-money-bill-wave" />
            {job.salary || "Thỏa thuận"}
          </span>
        </div>

        <span className="text-slate-500 text-xs">
          Đã lưu {formatTimeAgo(job.savedAt)}
        </span>
      </div>
    </div>
  );
};

export default SavedJobCard;
