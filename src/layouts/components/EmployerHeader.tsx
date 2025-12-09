import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button, Dropdown, Avatar, message, Tag } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ROLES } from "../../constants/roles";
import { logout } from "../../features/auth/slice";
import { removeAccessToken } from "../../services/baseService";
import baseService from "../../services/baseService";
import {
  fetchEmployerProfile,
  clearProfile as clearEmployerProfile,
} from "../../features/employer/slice/profileSlice";
import SystemReportModal from "../../features/report/components/SystemReportModal";
import type { User } from "../../features/auth/types";
import LogoImage from "../../assets/logo.png";

const LogoWhite = LogoImage;

interface EmployerHeaderProps {
  onToggleSidebar?: () => void;
}

type RemainingResponse = {
  remaining?: number;
  remainingPosts?: number;
  remainingPost?: number;
  planName?: string;
  plan?: string;
  planLevel?: string;
  tier?: string;
  name?: string;
  planId?: number | string;
  planID?: number | string;
};

const extractRemainingPayload = (res: unknown): number | RemainingResponse | null => {
  if (res && typeof res === "object" && "data" in res) {
    const val = (res as { data?: unknown }).data;
    if (typeof val === "number") return val;
    if (val && typeof val === "object") return val as RemainingResponse;
    return null;
  }
  if (typeof res === "number") return res;
  if (res && typeof res === "object") return res as RemainingResponse;
  return null;
};

export const EmployerHeader: React.FC<EmployerHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const employerProfile = useAppSelector((state) => state.profile.profile);
  const employerProfileLoading = useAppSelector((state) => state.profile.loading);
  const employerProfileError = useAppSelector((state) => state.profile.error);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldLoadEmployerProfile = !!user && user.roles.includes(ROLES.EMPLOYER) && !isAdminRoute;

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
  }, [dispatch, employerProfile, employerProfileError, employerProfileLoading, shouldLoadEmployerProfile]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.id) return;
      try {
        const res = await baseService.get(`/EmployerPost/remaining-posts/${user.id}`);
        const payload = extractRemainingPayload(res);
        const payloadObj = payload && typeof payload === "object" ? (payload as RemainingResponse) : undefined;

        const remaining =
          typeof payload === "number"
            ? payload
            : payloadObj?.remaining ?? payloadObj?.remainingPosts ?? payloadObj?.remainingPost ?? null;

        const planRaw =
          payloadObj?.planName ?? payloadObj?.plan ?? payloadObj?.planLevel ?? payloadObj?.tier ?? payloadObj?.name;
        const planIdRaw = payloadObj?.planId ?? payloadObj?.planID;
        const planIdNum = typeof planIdRaw === "string" ? Number(planIdRaw) : planIdRaw;
        const planLower = typeof planRaw === "string" ? planRaw.toLowerCase() : "";
        const isPremium =
          planIdNum === 3 || (planLower !== "" && (planLower.includes("premium") || planLower.startsWith("pre")));

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
  }, [user]);

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
            icon: <UserOutlined />,
            label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink>,
          },
          {
            key: "billing-history",
            icon: <FileTextOutlined />,
            label: <NavLink to="/nha-tuyen-dung/lich-su-giao-dich">Lịch sử gói & giao dịch</NavLink>,
          },
        ]),
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: <NavLink to="/nha-tuyen-dung/doi-mat-khau">Đổi mật khẩu</NavLink>,
    },
    {
      key: "system-report",
      label: <span onClick={() => setReportModalOpen(true)}>Dịch vụ hỗ trợ của hệ thống</span>,
      icon: <CustomerServiceOutlined />,
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
        className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-900 text-white shadow-lg py-4 px-6 flex items-center justify-between sticky top-0 z-20"
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

          <NavLink to="/nha-tuyen-dung/dashboard" className="flex items-center">
            <img src={LogoWhite} alt="Logo" className="h-8 mr-2" />
          </NavLink>
            <NavLink
              to={location.pathname.startsWith("/admin") ? "/admin/dashboard" : "/nha-tuyen-dung/dashboard"}
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              Trang chủ
            </NavLink>
        </div>

        <div className="flex items-center space-x-5">
          {user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN)) ? (
            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
              <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-white hover:text-gray-200">
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
              <NavLink to="/login" className="text-white hover:text-gray-200 text-sm font-medium">
                Đăng nhập
              </NavLink>
              <NavLink to="/nha-tuyen-dung/register" className="text-white hover:text-gray-200 text-sm font-medium">
                Đăng ký
              </NavLink>
            </div>
          )}

          <div className="border-l border-blue-700 h-6" />

        </div>
      </header>
      <SystemReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
};

export default EmployerHeader;
