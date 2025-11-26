import React, { useEffect, useState } from "react";
import { Rate, Tag } from "antd";
import type { Employer } from "../types";
import ratingService from "../../../services/ratingService";

interface EmployerCardProps {
  employer: Employer;
}

const EmployerCard: React.FC<EmployerCardProps> = ({ employer }) => {
  const [rating, setRating] = useState<number>(employer.rating || 0);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const avg = await ratingService.getAverageRatingForUser(employer.id);
        setRating(avg);
      } catch (error) {
        console.error("Failed to fetch rating for employer", employer.id, error);
      }
    };

    if (employer.id) {
      fetchRating();
    }
  }, [employer.id]);

  const logoSrc = employer.logo || "/src/assets/no-logo.png";
  const locationDisplay =
    employer.locations && employer.locations.length > 0
      ? employer.locations.join(", ")
      : "Đang cập nhật";

  return (
    <div className="h-full rounded-2xl border border-slate-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-28 overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-2 shadow-lg ring-2 ring-white/70">
          <img
            src={logoSrc}
            alt={`${employer.name} Logo`}
            className="h-full w-full object-contain rounded-xl"
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-12 text-center">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 min-h-[48px]">
          {employer.name}
        </h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Rate disabled allowHalf value={rating} className="text-sm" />
          <span className="text-xs text-slate-500">{rating.toFixed(1)}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <Tag color="blue" className="m-0 px-2 py-1 rounded-full">
            {employer.jobCount > 0
              ? `${employer.jobCount} việc đang tuyển`
              : "Chưa có tin tuyển"}
          </Tag>
          <div className="flex items-center gap-1 text-slate-500" title={locationDisplay}>
            <i className="fas fa-map-marker-alt text-red-500" />
            <span className="truncate max-w-[160px]">{locationDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerCard;
