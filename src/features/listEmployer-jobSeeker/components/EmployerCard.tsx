import React, { useEffect, useState } from "react";
import { Rate } from "antd";
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
        console.error(
          "Failed to fetch rating for employer",
          employer.id,
          error
        );
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
      : "...";

  return (
    <div className="p-2">
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative h-[320px] pb-4 flex flex-col">
        <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-orange-500 border-r-transparent z-10"></div>
        <div
          className="w-full h-24 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://static.careerlink.vn/image/6c39d2c56e6a82d2b608aeeabe0d7127)",
          }}
        ></div>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center p-1">
          <img
            src={logoSrc}
            alt={`${employer.name} Logo`}
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <div className="pt-16 text-center px-4 flex-1 flex flex-col justify-between">
          <h3 className="text-xl font-bold text-gray-800 mt-2 line-clamp-2 min-h-14">
            {employer.name}
          </h3>

          <div className="min-h-10 mt-2 flex justify-center items-center">
            <Rate disabled allowHalf value={rating} className="text-sm" />
          </div>

          <div className="mt-auto">
            <p className="text-gray-600 text-sm mt-2">
              {employer.jobCount > 0 ? (
                <span className="text-blue-600 font-semibold">
                  {employer.jobCount} vi?c dang tuy?n
                </span>
              ) : (
                <span>Hi?n chua có tuy?n d?ng</span>
              )}
            </p>

            <div
              className="flex items-center justify-center text-gray-500 text-xs mt-1"
              title={locationDisplay}
            >
              <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
              <span className="truncate max-w-[200px]">{locationDisplay}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerCard;
