import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { Button, Dropdown, Avatar, message } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { ROLES } from "../../constants/roles";
import { logout } from "../../features/auth/slice";
import { removeAccessToken } from "../../services/baseService";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchEmployerProfile, clearProfile as clearEmployerProfile } from "../../features/employer/slice/profileSlice";
import SystemReportModal from "../../features/report/components/SystemReportModal";
import type { User } from "../../features/auth/types";

const LogoWhite = "/vite.svg";

interface EmployerHeaderProps {
  onToggleSidebar?: () => void;
}

export const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const employerProfile = useAppSelector((state) => state.profile.profile);
  const employerProfileLoading = useAppSelector((state) => state.profile.loading);
  const employerProfileError = useAppSelector((state) => state.profile.error);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldLoadEmployerProfile =
    !!user && user.roles.includes(ROLES.EMPLOYER) && !isAdminRoute;
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (
      shouldLoadEmployerProfile &&
      !employerProfile &&
      !employerProfileLoading &&
      !employerProfileError
    ) {
      dispatch(fetchEmployerProfile());
    }
  }, [
    dispatch,
    employerProfile,
    employerProfileError,
    employerProfileLoading,
    shouldLoadEmployerProfile,
  ]);

  type UserWithOptionalFields = User & { avatarUrl?: string | null; fullName?: string | null };
  const typedUser: UserWithOptionalFields | undefined = user
    ? {
        ...user,
        avatarUrl: user.avatarUrl ?? null,
        fullName: user.fullName ?? user.username ?? null,
      }
    : undefined;

  const fallbackAvatar = typedUser?.avatarUrl ?? typedUser?.avatar ?? undefined;
  const avatarSrc = employerProfile?.avatarUrl || fallbackAvatar;
  const displayName =
    employerProfile?.displayName ||
    employerProfile?.contactName ||
    employerProfile?.username ||
    typedUser?.fullName ||
    typedUser?.username;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearEmployerProfile());
    removeAccessToken();
    navigate("/login");
    message.success("Đăng xuất thành công!");
  };

  const dropdownItems = [
    ...(location.pathname.startsWith("/admin") || !user?.roles.includes(ROLES.EMPLOYER)
      ? []
      : [
          {
            key: "profile",
            label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink>,
          },
        ]),
    {
      key: "system-report",
      label: <span onClick={() => setReportModalOpen(true)}>Dịch vụ hỗ trợ hệ thống</span>,
      icon: <CustomerServiceOutlined />,
    },
    {
      key: "change-password",
      label: <NavLink to="/nha-tuyen-dung/doi-mat-khau">Đổi mật khẩu</NavLink>,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <>
    <header
      className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ height: "68px" }}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            type="text"
            icon={<MenuFoldOutlined style={{ color: "white", fontSize: 18 }} />}
            onClick={onToggleSidebar}
          />
        )}

        <img src={LogoWhite} alt="Logo" className="h-8 mr-2" />
        <NavLink
          to="/nha-tuyen-dung/dashboard"
          className="text-white hover:text-gray-200 text-sm font-medium"
        >
          Trang chủ
        </NavLink>
      </div>

      <div className="flex items-center space-x-5">

        {/* USER DROPDOWN */}
        {user &&
        (user.roles.includes(ROLES.EMPLOYER) ||
          user.roles.includes(ROLES.ADMIN)) ? (
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
            <a
              onClick={(e) => e.preventDefault()}
              className="flex items-center space-x-2 text-white hover:text-gray-200"
            >
              <Avatar
                size="small"
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : undefined}
                className="bg-blue-600"
              >
                {!avatarSrc && displayName ? displayName.charAt(0).toUpperCase() : null}
              </Avatar>
              <span className="font-medium">{displayName}</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </a>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-4">
            <NavLink
              to="/login"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              Đăng nhập
            </NavLink>
            <NavLink
              to="/nha-tuyen-dung/register"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              Đăng ký
            </NavLink>
          </div>
        )}
      </div>
    </header>
    <SystemReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
};

export default EmployerHeader;


