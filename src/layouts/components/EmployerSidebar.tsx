import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, Menu, type MenuProps } from 'antd';
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
  PieChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';
import { ROLES } from '../../constants/roles';

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem => ({ key, icon, children, label } as MenuItem);

interface SidebarProps {
  isOpen: boolean;
}

const EmployerSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const employerItems: MenuItem[] = [
    getItem(
      <NavLink to="/nha-tuyen-dung/dashboard">Thông tin</NavLink>,
      '/nha-tuyen-dung/dashboard',
      <HomeOutlined />
    ),
    getItem('Công việc', 'sub-cong-viec', <FileTextOutlined />, [
      getItem(
        <NavLink to="/nha-tuyen-dung/cong-viec">Bài đăng của tôi</NavLink>,
        '/nha-tuyen-dung/cong-viec'
      ),
      getItem(
        <NavLink to="/nha-tuyen-dung/dang-tin">Đăng bài</NavLink>,
        '/nha-tuyen-dung/dang-tin'
      )
    ]),
    getItem(
      <NavLink to="/nha-tuyen-dung/tim-kiem">Bài đăng tìm việc</NavLink>,
      '/nha-tuyen-dung/tim-kiem',
      <SearchOutlined />
    ),
    getItem(
      <NavLink to="/nha-tuyen-dung/cam-nang">Cẩm nang tuyển dụng</NavLink>,
      '/nha-tuyen-dung/cam-nang',
      <ReadOutlined />
    )
  ];

  const adminItems: MenuItem[] = [
    getItem(<NavLink to="/admin/dashboard">Dashboard</NavLink>, '/admin/dashboard', <PieChartOutlined />),
    getItem(
      <NavLink to="/admin/accounts">Quản lý tài khoản</NavLink>,
      '/admin/accounts',
      <UserOutlined />
    ),
    getItem('Quản lý bài viết', 'sub-admin-post', <FileTextOutlined />, [
      getItem(
        <NavLink to="/admin/job-posts">Bài đăng tuyển dụng</NavLink>,
        '/admin/job-posts'
      ),
      getItem(
        <NavLink to="/admin/jobseeker-post">Bài đăng người tìm việc</NavLink>,
        '/admin/jobseeker-post'
      ),
      getItem(
        <NavLink to="/admin/employer-post">Bài đăng nhà tuyển dụng</NavLink>,
        '/admin/employer-post'
      )
    ]),
    getItem(
      <NavLink to="/admin/categories">Quản lý danh mục</NavLink>,
      '/admin/categories',
      <AppstoreOutlined />
    ),
    getItem(
      <NavLink to="/admin/news">Quản lý tin tức</NavLink>,
      '/admin/news',
      <ReadOutlined />
    ),
    getItem(
      <NavLink to="/admin/reports">Báo cáo & Khiếu nại</NavLink>,
      '/admin/reports',
      <WarningOutlined />
    ),
    getItem(
      <NavLink to="/admin/settings">Cài đặt hệ thống</NavLink>,
      '/admin/settings',
      <SettingOutlined />
    ),
    getItem(
      <NavLink to="/admin/help">Trung tâm hỗ trợ</NavLink>,
      '/admin/help',
      <QuestionCircleOutlined />
    )
  ];

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];
    if (user.roles.includes(ROLES.ADMIN)) {
      return adminItems;
    }
    if (user.roles.includes(ROLES.EMPLOYER)) {
      return employerItems;
    }
    return [];
  };

  const currentMenu = getMenuItems();

  const defaultOpenKey = currentMenu.find(
    (item) =>
      item &&
      'children' in item &&
      Array.isArray(item.children) &&
      item.children.some((child) => child && child.key === location.pathname)
  )?.key as string;

  return (
    <aside
      className={`bg-white shadow-md flex flex-col flex-shrink-0 sticky top-[68px] h-[calc(100vh-68px)] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={!isOpen}
          items={currentMenu}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[defaultOpenKey || '']}
          className="h-full border-r-0"
        />
      </div>

      {user && (
        <div className="p-4 flex-shrink-0 border-top border-gray-200">
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
    </aside>
  );
};

export default EmployerSidebar;
