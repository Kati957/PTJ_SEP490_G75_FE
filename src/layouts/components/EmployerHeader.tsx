import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks";
import { Button, Dropdown, Avatar, message, Tag } from "antd";
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
import baseService from "../../services/baseService";
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
  const [planStatus, setPlanStatus] = useState<{ label?: string; remaining?: number | null; isPremium: boolean }>({
    isPremium: false,
    remaining: null,
  });

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

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.id) return;
      try {
        const res = await baseService.get(`/EmployerPost/remaining-posts/${user.id}`);
        const data = (res as any)?.data ?? res;
        const remaining =
          typeof data === "number"
            ? data
            : data?.remaining ?? data?.remainingPosts ?? data?.remainingPost ?? null;
        const planRaw =
          (typeof data === "object" && data
            ? data.planName || data.plan || data.planLevel || data.tier || data.name
            : undefined) || undefined;
        const planIdRaw = typeof data === "object" && data ? data.planId ?? data.planID ?? undefined : undefined;
        const planId = typeof planIdRaw === "string" ? Number(planIdRaw) : planIdRaw;
        const planLower = typeof planRaw === "string" ? planRaw.toLowerCase() : "";
        const isPremium =
          planId === 3 ||
          (typeof planIdRaw === "string" && planIdRaw === "3") ||
          (planLower && (planLower.includes("premium") || planLower.startsWith("pre")));

        setPlanStatus({
          label: planRaw ? String(planRaw) : undefined,
          remaining: typeof remaining === "number" ? remaining : null,
          isPremium: Boolean(isPremium),
        });
      } catch (error) {
        console.error("remaining-posts error", error);
        setPlanStatus({ isPremium: false, remaining: null });
      }
    };

    if (user?.roles.includes(ROLES.EMPLOYER)) {
      void fetchPlan();
    }
  }, [user, setPlanStatus]);

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
    message.success("Dang xuat thanh cong!");
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
      label: <span onClick={() => setReportModalOpen(true)}>Dịch vụ hỗ trợ của hệ thống</span>,
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
          Trang ch?
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
              <span className="font-medium flex items-center gap-1">
                {displayName}
                {planStatus.isPremium && (
                  <Tag color="gold" className="m-0">
                    {planStatus.label ? planStatus.label.toUpperCase() : "PREMIUM"}
                  </Tag>
                )}
              </span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </a>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-4">
            <NavLink
              to="/login"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
           �ang nh?p
            </NavLink>
            <NavLink
              to="/nha-tuyen-dung/register"
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              �ang k�
            </NavLink>
          </div>
        )}

        <div className="border-l border-blue-700 h-6"></div>

        {location.pathname.startsWith("/nha-tuyen-dung") ? (
          <NavLink
            to="/login"
            className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Cho người tìm việc
          </NavLink>
        ) : (
          <NavLink
            to="/nha-tuyen-dung"
            className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Nhà tuyển dụng
          </NavLink>
        )}
      </div>
    </header>
    <SystemReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
};

export default EmployerHeader;







