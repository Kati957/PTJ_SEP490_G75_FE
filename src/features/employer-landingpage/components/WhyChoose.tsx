import React from 'react';

const laptopImageUrl = 'https://res.cloudinary.com/demo/image/upload/w_400,h_250,c_fill/sample.jpg';

export const WhyChoose: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-bold mb-5">Tại sao chọn Part-time Job Finder.vn?</h2>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        Là nhà cung cấp hàng đầu các dịch vụ tuyển dụng trực tuyến tại Việt Nam, Part-time Job Finder.vn có hơn 100,000 người tìm việc mỗi ngày. Đăng công việc trên Part-time Job Finder.vn là cách hiệu quả nhất để nhận hồ sơ phù hợp từ người tìm việc.
      </p>
      <img 
        src={laptopImageUrl} 
        alt="Laptop demo" 
        className="w-full h-auto rounded-md border border-gray-200"
      />
    </section>
  );
};