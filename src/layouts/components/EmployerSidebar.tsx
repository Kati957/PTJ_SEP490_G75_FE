import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, Menu, type MenuProps, Button } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReadOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  WarningOutlined,
  AppstoreOutlined,
  PieChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';
import { ROLES } from '../../constants/roles';

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

interface SidebarProps {
  isOpen: boolean;
}

export const EmployerSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isEmployer = Boolean(user && user.roles.includes(ROLES.EMPLOYER));
  const isAdmin = Boolean(user && user.roles.includes(ROLES.ADMIN));

  const employerNav = [
    { to: '/nha-tuyen-dung/dashboard', label: 'Trang chính', icon: <HomeOutlined /> },
    { to: '/nha-tuyen-dung/dang-tin', label: 'Đăng bài tuyển dụng công việc', icon: <PlusOutlined /> },
    { to: '/nha-tuyen-dung/cong-viec', label: 'Quản lí bài đăng tuyển dụng', icon: <FileTextOutlined /> },
    { to: '/nha-tuyen-dung/tim-kiem', label: 'Danh sách bài đăng tìm việc của ứng viên', icon: <SearchOutlined /> },
    { to: '/nha-tuyen-dung/cam-nang', label: 'Cẩm nang tuyển dụng', icon: <ReadOutlined /> },
  ];

  const adminItems: MenuItem[] = [
    getItem(<NavLink to="/admin/dashboard">Dashboard</NavLink>, '/admin/dashboard', <PieChartOutlined />),
    getItem(<NavLink to="/admin/accounts">Quản lý tài khoản</NavLink>, '/admin/accounts', <UserOutlined />),
    getItem('Quản lý bài viết', 'sub-admin-post', <FileTextOutlined />, [
      getItem(<NavLink to="/admin/job-posts">Bài đăng tuyển dụng</NavLink>, '/admin/job-posts'),
      getItem(<NavLink to="/admin/jobseeker-post">Bài đăng người tìm việc</NavLink>, '/admin/jobseeker-post'),
      getItem(<NavLink to="/admin/employer-post">Bài đăng nhà tuyển dụng</NavLink>, '/admin/employer-post'),
    ]),
    getItem(<NavLink to="/admin/categories">Quản lý danh mục ngành nghề</NavLink>, '/admin/categories', <AppstoreOutlined />),
    getItem(<NavLink to="/admin/news">Quản lý tin tức</NavLink>, '/admin/news', <ReadOutlined />),
    getItem(<NavLink to="/admin/reports">Báo cáo & Khiếu nại</NavLink>, '/admin/reports', <WarningOutlined />),
    getItem(<NavLink to="/admin/settings">Cài đặt hệ thống</NavLink>, '/admin/settings', <SettingOutlined />),
    getItem(<NavLink to="/admin/help">Trung tâm hỗ trợ</NavLink>, '/admin/help', <QuestionCircleOutlined />),
  ];

  const currentMenu = isAdmin ? adminItems : [];
  const defaultOpenKey = currentMenu.find(
    (item) =>
      item &&
      "children" in item &&
      Array.isArray(item.children) &&
      item.children.some((child) => child && child.key === location.pathname)
  )?.key as string;

  const renderEmployerNav = () => (
    <nav className="flex-1 overflow-y-auto bg-white">
      <div className="py-3 space-y-1">
        {employerNav.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-5 py-3 text-base font-medium rounded-lg w-full ${
                active
                  ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-500'
                  : 'text-slate-700 hover:bg-slate-50'
              } ${!isOpen ? 'justify-center' : ''}`}
              title={!isOpen ? item.label : undefined}
            >
              <span className="text-base">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );

  return (
    <aside
      className={`bg-slate-50 shadow-md flex flex-col flex-shrink-0 sticky top-[68px] h-[calc(100vh-68px)] transition-all duration-300 border-r border-slate-100 ${
        isOpen ? 'w-72' : 'w-24'
      }`}
    >
      {isEmployer ? (
        <>
          <div className="px-5 py-6 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <Avatar
                size={56}
                src={(user as any)?.avatarUrl || user?.avatar || undefined}
                icon={<UserOutlined />}
                className="bg-blue-600"
                alt={user?.username}
              >
                {user?.username.charAt(0).toUpperCase()}
              </Avatar>
              {isOpen && (
                <div className="space-y-1">
                  <div className="font-semibold text-lg text-slate-900">{user?.username}</div>
                  <div className="text-xs text-slate-500">Employer</div>
                  <div className="text-xs">
                    <span className="text-slate-500">Tài khoản:</span>{' '}
                    {user?.verified ? (
                      <span className="font-semibold text-emerald-600">Đã xác thực</span>
                    ) : (
                      <span className="font-semibold text-amber-600">Chưa xác thực</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {renderEmployerNav()}
        </>
      ) : (
        <>
          <div className="flex items-center justify-center px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
            {isOpen ? 'Bảng điều khiển' : 'BDK'}
          </div>
          <div className="flex-1 overflow-y-auto">
            <Menu
              mode="inline"
              theme="light"
              inlineCollapsed={!isOpen}
              items={currentMenu}
              selectedKeys={[location.pathname]}
              defaultOpenKeys={[defaultOpenKey || '']}
              className="h-full border-r-0 bg-transparent"
              style={{ padding: isOpen ? 12 : 8 }}
            />
          </div>
          {user && (
            <div className="p-4 flex-shrink-0 border-t border-gray-200 bg-white">
              <div className={`flex items-center space-x-3 ${!isOpen ? 'justify-center' : ''}`}>
                <Avatar size={40} icon={<UserOutlined />} className="bg-blue-600">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                {isOpen && (
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};
