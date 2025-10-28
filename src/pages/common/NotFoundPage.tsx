import React from 'react';

import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-inter">
      <div className="max-w-md text-center">
        
        <svg 
          className="mx-auto h-24 w-24 text-blue-600" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={1.5}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 16c0-1.01.325-1.94.87-2.73m6.26 2.73c.545.79.87 1.72.87 2.73" 
          />
        </svg>

        <h1 className="mt-6 text-8xl font-bold tracking-tight text-blue-600">
          404
        </h1>

        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-700 sm:text-4xl">
          Trang không tồn tại
        </p>
        
        <p className="mt-6 text-base leading-7 text-slate-600">
          Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có vẻ như đường dẫn đã bị sai hoặc trang đã bị xóa.
        </p>
        
        <div className="mt-10 flex items-center justify-center">
          <Link
            to="/"
            className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;