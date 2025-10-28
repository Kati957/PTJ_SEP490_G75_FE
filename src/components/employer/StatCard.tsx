import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor = 'bg-white' 
}) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm border border-gray-200 ${bgColor} flex items-start space-x-4`}>
      {icon && (
        <div className="text-2xl text-blue-600 flex-shrink-0 mt-1">
          {icon}
        </div>
      )}
      <div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
};