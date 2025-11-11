import React from 'react';
import type { Employer } from '../types';


interface EmployerCardProps {
  employer: Employer;
}

const EmployerCard: React.FC<EmployerCardProps> = ({ employer }) => {
  const logoSrc = employer.logo || '/src/assets/no-logo.png';
  
  return (
    <>
    <div key={employer.id} className="p-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative h-[320px] pb-4 flex flex-col">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-orange-500 border-r-transparent z-10"></div>
                <div
                  className="w-full h-24 bg-cover bg-center"
                  style={{
                    backgroundImage: 'url(https://static.careerlink.vn/image/6c39d2c56e6a82d2b608aeeabe0d7127)',
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

                  {employer.jobDescription ? (
                    <p className="text-blue-600 text-sm mt-2 line-clamp-2 min-h-10">
                      {employer.jobDescription}
                    </p>
                  ) : (
                    <div className="min-h-10 mt-2" />
                  )}

                  <div className="mt-auto">
                    {" "}
                    <p className="text-gray-600 text-sm mt-2">
                      10 việc đang tuyển
                    </p>
                    <div className="flex items-center justify-center text-gray-500 text-xs mt-1">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      <span className="truncate">Đà Nẵng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
  );
};

export default EmployerCard;