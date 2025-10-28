import React from 'react';

interface Props {
  percent: number;
  label: string;
}

export const SimpleProgressBar: React.FC<Props> = ({ percent, label }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-bold text-blue-600">{percent}%</span>
        <div className="flex-grow bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">{label}</p>
      
      <button className="text-sm text-blue-600 hover:underline mt-3">
        + Thêm thông tin công việc
      </button>
    </div>
  );
};