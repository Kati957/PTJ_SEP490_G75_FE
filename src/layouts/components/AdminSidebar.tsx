import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserSwitchOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  FlagOutlined,
  NotificationOutlined
} from '@ant-design/icons';

type AdminNavItem = {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const accents: Record<string, { gradient: string; border: string; icon: string; strip: string }> = {
  '/admin/dashboard': {
    gradient: 'linear-gradient(90deg, rgba(107,91,255,0.12) 0%, rgba(123,109,255,0.12) 50%, rgba(138,124,255,0.12) 100%)',
    border: 'border-[#e6e0ff]',
    icon: 'text-[#6b5bff]',
    strip: '#c4b5fd'
  },
  '/admin/accounts': {
    gradient: 'linear-gradient(90deg, rgba(15,123,216,0.10) 0%, rgba(15,142,245,0.10) 50%, rgba(15,166,255,0.10) 100%)',
    border: 'border-[#e0f0ff]',
    icon: 'text-[#0f7bd8]',
    strip: '#b7ddff'
  },
  '/admin/job-posts': {
    gradient: 'linear-gradient(90deg, rgba(164,69,245,0.12) 0%, rgba(142,68,255,0.12) 50%, rgba(122,60,245,0.12) 100%)',
    border: 'border-[#efe4ff]',
    icon: 'text-[#8e44ff]',
    strip: '#d8c5ff'
  },
  '/admin/categories': {
    gradient: 'linear-gradient(90deg, rgba(16,185,129,0.10) 0%, rgba(15,191,144,0.10) 50%, rgba(14,166,111,0.10) 100%)',
    border: 'border-[#dcf7ea]',
    icon: 'text-[#10b981]',
    strip: '#b5f0d1'
  },
  '/admin/reports': {
    gradient: 'linear-gradient(90deg, rgba(244,63,94,0.12) 0%, rgba(229,57,85,0.12) 50%, rgba(242,91,91,0.12) 100%)',
    border: 'border-[#ffe1e6]',
    icon: 'text-[#e53955]',
    strip: '#f9c2cb'
  },
  '/admin/news': {
    gradient: 'linear-gradient(90deg, rgba(245,158,11,0.14) 0%, rgba(247,168,51,0.14) 50%, rgba(249,115,22,0.14) 100%)',
    border: 'border-[#ffe9cc]',
    icon: 'text-[#d97706]',
    strip: '#ffd8a1'
  }
};

const adminNavItems: AdminNavItem[] = [
  {
    path: '/admin/dashboard',
    label: 'Tổng quan',
    description: 'Theo dõi trạng thái hệ thống',
    icon: <HomeOutlined />
  },
  {
    path: '/admin/accounts',
    label: 'Quản lý tài khoản người dùng',
    description: 'Quản lý người dùng và quyền hạn',
    icon: <UserSwitchOutlined />
  },
  {
    path: '/admin/job-posts',
    label: 'Quản lý bài đăng tuyển dụng và tìm kiếm việc',
    description: 'Duyệt và kiểm soát bài tuyển dụng và bài tìm kiếm việc làm',
    icon: <FileTextOutlined />
  },
  {
    path: '/admin/categories',
    label: 'Quản lý danh mục ngành nghề công việc',
    description: 'Điều chỉnh cấu trúc danh mục cho ngành nghề',
    icon: <AppstoreOutlined />
  },
  {
    path: '/admin/reports',
    label: 'Quản lý báo cáo của hệ thống',
    description: 'Xử lý phản hồi và vi phạm từ người dùng và lỗi hệ thống',
    icon: <FlagOutlined />
  },
  {
    path: '/admin/news',
    label: 'Quản lý tin tức',
    description: 'Quản lý tin tức của trang tuyển dụng',
    icon: <NotificationOutlined />
  }
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="bg-white border-r border-gray-100 w-72 flex-shrink-0 h-[calc(100vh-68px)] sticky top-[68px] overflow-y-auto shadow-md">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs uppercase tracking-widest text-gray-400">Trung tâm quản trị</p>
        <p className="text-sm text-gray-500 mt-1">Chọn module bạn muốn quản lý</p>
      </div>
      <nav className="p-4 flex flex-col gap-3">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const accent = accents[item.path];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex gap-3 rounded-2xl border px-3 py-3 transition-all relative overflow-hidden ${
                isActive && accent
                  ? `border ${accent.border} text-gray-900 shadow`
                  : 'border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50'
              }`}
              style={isActive && accent ? { backgroundImage: accent.gradient } : undefined}
            >
              <span
                className={`absolute left-0 top-0 h-full w-2 rounded-full ${isActive && accent ? '' : 'bg-transparent'}`}
                style={isActive && accent ? { background: accent.strip } : undefined}
              />
              <span
                className={`text-lg flex items-center rounded-xl bg-white/80 px-2 py-1 shadow-sm ${
                  isActive && accent ? accent.icon : 'text-gray-400'
                }`}
              >
                {item.icon}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-gray-900">{item.label}</span>
                <span className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{item.description}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
