import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { ROLES } from "../../constants/roles";
import { Avatar, Menu, type MenuProps } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  ReadOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

const menuDivider: MenuItem = { type: "divider" };

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();


  // Mục menu chính
  const employerItems: MenuItem[] = [
    getItem(
      <NavLink to="/nha-tuyen-dung/dashboard">My CareerLink</NavLink>,
      "/nha-tuyen-dung/dashboard",
      <HomeOutlined />
    ),
    getItem("Công Việc", "sub-cong-viec", <FileTextOutlined />, [
      getItem(
        <NavLink to="/nha-tuyen-dung/cong-viec">Công Việc của tôi</NavLink>,
        "/nha-tuyen-dung/cong-viec"
      ),
      getItem(
        <NavLink to="/nha-tuyen-dung/dang-tin">Đăng Tuyển dụng</NavLink>,
        "/nha-tuyen-dung/dang-tin"
      ),
    ]),
    getItem("Ứng viên của tôi", "sub-ung-vien", <TeamOutlined />, [
      getItem(
        <NavLink to="/nha-tuyen-dung/tim-kiem">Tìm kiếm tài năng</NavLink>,
        "/nha-tuyen-dung/tim-kiem",
        <SearchOutlined />
      ),
      getItem(
        <NavLink to="/nha-tuyen-dung/tai-nang-da-xem">Tài năng đã xem</NavLink>,
        "/nha-tuyen-dung/tai-nang-da-xem",
        <UserSwitchOutlined />
      ),
    ]),
    getItem("Blog", "sub-blog", <ReadOutlined />, [
      getItem(
        <NavLink to="/nha-tuyen-dung/cam-nang">Cẩm nang Tuyển dụng</NavLink>,
        "/nha-tuyen-dung/cam-nang"
      ),
    ]),
  ];

  // Mục menu Hỗ trợ
  const supportItems: MenuItem[] = [
    menuDivider,
    getItem(
      <a href="#">Hỗ trợ</a>,
      "support",
      <QuestionCircleOutlined />
    ),
    getItem(
      <NavLink to="/nha-tuyen-dung/cai-dat">Cài đặt</NavLink>,
      "/nha-tuyen-dung/cai-dat",
      <SettingOutlined />
    ),
  ];

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];
    switch (user.role) {
      case ROLES.EMPLOYER:
        return [...employerItems, ...supportItems];
      case ROLES.ADMIN:
        return []; //  menu admin
      default:
        return []; //  menu job seeker
    }
  };

  const defaultOpenKey = employerItems.find((item) =>
    item && 'children' in item && Array.isArray(item.children) &&
    item.children.some((child) => child && child.key === location.pathname)
  )?.key as string;

  return (
    <aside
      className={`bg-white shadow-md flex flex-col flex-shrink-0 sticky top-[68px]
    h-[calc(100vh-68px)] transition-all duration-300
    ${isOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={!isOpen}
          items={getMenuItems()}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[defaultOpenKey || ""]}
          className="h-full border-r-0"
        />
      </div>

      {/* 2. Phần User (cố định ở dưới, KHÔNG CÒN MENU) */}
      {user && (
        <div className="p-4 flex-shrink-0 border-t border-gray-200">
        
          <div
            className={`flex items-center space-x-3 ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <Avatar size={40} icon={<UserOutlined />} className="bg-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            {isOpen && (
              <div>
                <div className="font-semibold text-sm text-gray-800">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};