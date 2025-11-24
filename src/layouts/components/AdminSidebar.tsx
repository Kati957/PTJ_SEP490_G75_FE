import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  UserSwitchOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  FlagOutlined,
  NotificationOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

interface AdminNavItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  {
    path: "/admin/dashboard",
    label: "Tong quan",
    description: "Theo doi trang thai he thong",
    icon: <HomeOutlined />,
  },
  {
    path: "/admin/accounts",
    label: "Tai khoan",
    description: "Quan ly nguoi dung va quyen han",
    icon: <UserSwitchOutlined />,
  },
  {
    path: "/admin/job-posts",
    label: "Bai dang viec lam",
    description: "Duyet va kiem soat bai tuyen dung",
    icon: <FileTextOutlined />,
  },
  {
    path: "/admin/employer-registrations",
    label: "Ho so nha tuyen dung",
    description: "Duyet tai khoan nha tuyen dung",
    icon: <SolutionOutlined />,
  },
  {
    path: "/admin/categories",
    label: "Danh muc",
    description: "Dieu chinh cau truc danh muc",
    icon: <AppstoreOutlined />,
  },
  {
    path: "/admin/reports",
    label: "Bao cao",
    description: "Xu ly phan hoi va vi pham",
    icon: <FlagOutlined />,
  },
  {
    path: "/admin/news",
    label: "Tin tuc",
    description: "Quan ly tin tuc va thong bao",
    icon: <NotificationOutlined />,
  },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="bg-white border-r border-gray-100 w-80 flex-shrink-0 h-[calc(100vh-68px)] sticky top-[68px] overflow-y-auto shadow-md">
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-xs uppercase tracking-widest text-gray-400">Trung tâm quản trị</p>
        <p className="text-sm text-gray-500 mt-1">Chọn module bạn muốn quản lý</p>
      </div>
      <nav className="p-5 flex flex-col gap-4">
        {adminNavItems.map((item) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex gap-3 rounded-2xl px-4 py-3 transition-all items-start border border-slate-100 border-l-4 ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm border-l-blue-500"
                  : "text-gray-700 hover:border-gray-200 hover:bg-gray-50 border-l-transparent hover:border-l-blue-200"
              }`}
            >
              <span className={`text-lg flex items-center ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                {item.icon}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold">{item.label}</span>
                <span className="text-xs text-gray-500">{item.description}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
