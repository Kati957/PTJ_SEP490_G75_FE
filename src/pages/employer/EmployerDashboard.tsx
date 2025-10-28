import React from 'react';
import { StatCard } from '../../components/employer/StatCard';
import { 
  InfoCircleOutlined, 
  CloseOutlined, 
  BellOutlined, 
  CreditCardOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';

const EmployerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <h1 className="text-2xl font-bold text-gray-800">My CareerLink</h1>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg relative flex justify-between items-start" role="alert">
        <div>
          <strong className="font-bold mr-2"><InfoCircleOutlined /> Tính năng mới</strong>
          <span className="block sm:inline">
            Để dùng quản lý thành viên - vai trò, thêm hoặc điều chỉnh thông tin thành viên trong tài khoản tuyển dụng của bạn. Xem chi tiết <a href="#" className="font-bold underline hover:text-blue-700">tại đây</a>
          </span>
        </div>
        <button className="text-blue-800 hover:text-blue-600">
          <CloseOutlined />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Yêu cầu hủy cấp hồ sơ" 
          value={0} 
          icon={<BellOutlined />} 
          bgColor="bg-orange-50"
        />
        <StatCard 
          title="Credis Left" 
          value={0} 
          icon={<CreditCardOutlined />} 
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Việc đang kích hoạt" 
          value={0} 
          icon={<CheckCircleOutlined />}
        />
        <StatCard 
          title="Thư xin việc gần đây" 
          value={0} 
          icon={<FileTextOutlined />}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Đơn ứng tuyển gần đây</h2>
          <a href="#" className="text-sm text-blue-600 hover:underline">Xem tất cả →</a>
        </div>
        <div className="flex border-b border-gray-200 mb-4">
          <button className="py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-semibold text-sm">Tất cả</button>
          <button className="py-2 px-4 text-gray-500 hover:text-gray-700 text-sm">Chưa xem</button>
        </div>
        <div className="text-center text-gray-500 py-10">
          <p>Bạn không có thư xin việc nào phù hợp</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Công việc đang kích hoạt</h2>
          <a href="#" className="text-sm text-blue-600 hover:underline">Xem tất cả (0) →</a>
        </div>
        <div className="text-center text-gray-500 py-10">
          <p>Không có công việc nào đang được kích hoạt</p>
        </div>
      </div>

    </div>
  );
};

export default EmployerDashboard;