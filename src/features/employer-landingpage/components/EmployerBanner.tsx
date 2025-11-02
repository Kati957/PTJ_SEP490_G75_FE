import React from 'react';

const bannerImageUrl = './src/assets/employer-banner.png';

export const EmployerBanner: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Nhà tuyển dụng</h1>
      <div className="w-full rounded-lg overflow-hidden shadow-sm">
        <img 
          src={bannerImageUrl} 
          alt="Nhà tuyển dụng" 
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};