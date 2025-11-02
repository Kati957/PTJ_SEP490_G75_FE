import React from 'react';

// Kiểu dữ liệu cho một dịch vụ
interface ServiceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Component con cho mỗi mục dịch vụ
const ServiceItem: React.FC<ServiceItemProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mr-4 text-2xl text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-base text-blue-700">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};

// Component chính
export const ServiceList: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-bold mb-5">Dịch vụ</h2>
      <div className="space-y-6">
        <ServiceItem
          icon="📄" // Thay bằng icon thật, ví dụ: <HiOutlineDocumentText />
          title="Đăng tin tuyển dụng"
          description="Đăng việc làm của bạn lên trang web của chúng tôi để thu hút hàng ứng viên tiềm năng"
        />
        <ServiceItem
          icon="🔍" // Thay bằng icon thật, ví dụ: <HiOutlineSearch />
          title="Tìm kiếm hồ sơ ứng viên"
          description="Truy cập kho ứng viên chất lượng của Part-time Job Finder để tìm đúng nhân tài cho công ty bạn"
        />
        <ServiceItem
          icon="👤" // Thay bằng icon thật, ví dụ: <HiOutlineUserGroup />
          title="Dịch vụ Nhân sự cao cấp"
          description="Executive Search - Giải pháp tối ưu cho nhân sự chủ chốt, nhân sự cao cấp và các vị trí đòi hỏi chuyên môn cao"
        />
      </div>
    </section>
  );
};