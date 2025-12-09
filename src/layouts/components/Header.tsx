import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button, Dropdown, Avatar, message } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  BankOutlined,
  BookOutlined,
  FileTextOutlined,
  HeartOutlined,
  SendOutlined,
  FileDoneOutlined,
  LockOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import { ROLES } from "../../constants/roles";
import { logout } from "../../features/auth/slice";
import { removeAccessToken } from "../../services/baseService";
import type { User } from "../../features/auth/types";
import LogoImage from "../../assets/logo.png";
import NotificationDropdown from "../../features/notification/components/NotificationDropdown";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { fetchJobSeekerProfile } from "../../features/profile-JobSeeker/slice/profileSlice";
import { clearJobSeekerProfile } from "../../features/profile-JobSeeker/slice/profileSlice";
import { clearProfile as clearEmployerProfile } from "../../features/employer/slice/profileSlice";
import SystemReportModal from "../../features/report/components/SystemReportModal";

type MainNavChild = { icon: React.ReactNode; text: string; path: string };
type MainNavLink = { icon: React.ReactNode; text: string; path?: string; children?: MainNavChild[] };


const LogoWhite = LogoImage;
const LogoColor = LogoImage;

interface HeaderProps {
  onToggleSidebar: () => void;
}

const jobSeekerNavLinks = [
  {
    icon: <FileDoneOutlined />,
    text: "Bài đăng tìm việc của tôi",
    path: "/quan-ly-bai-dang",
  },
  { icon: <HeartOutlined />, text: "Nhà tuyển dụng theo dõi", path: "/nha-tuyen-dung-theo-doi" },
  { icon: <HeartOutlined />, text: "Bài tuyển dụng đã lưu", path: "/viec-lam-da-luu" },
  {
    icon: <SendOutlined />,
    text: "Bài tuyển dụng đã ứng tuyển",
    path: "/viec-da-ung-tuyen",
  },
];


const mainNavLinks: MainNavLink[] = [
  { icon: <SearchOutlined />, text: "Danh sách việc làm", path: "/viec-lam" },
  { icon: <BankOutlined />, text: "Danh sách nhà tuyển dụng", path: "/employer" },
  { icon: <BookOutlined />, text: "Tin tức", path: "/news" },
];

const GuestDropdown = () => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: "450px" }}>
    <div className="flex justify-end items-center mb-4">
      <NavLink to="/login" className="mr-3">
        <Button type="primary" className="w-full">
          Đăng nhập
        </Button>
      </NavLink>
      <NavLink to="/register" className="mr-3">
        <Button className="w-full">Đăng ký</Button>
      </NavLink>
    </div>
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
      Vui lòng đăng nhập hoặc đăng ký để sử dụng các tính năng quản lý hồ sơ, ứng tuyển việc làm và nhiều hơn nữa.
    </div>
  </div>
);

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
  onReport: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, onReport }) => {
  const overviewLinks = [
    { icon: <UserOutlined />, text: "Hồ sơ của tôi", path: "/tai-khoan" },
    { icon: <LockOutlined />, text: "Đổi mật khẩu", path: "/doi-mat-khau" },
  ];

  const pairedPaths = ["/nha-tuyen-dung-theo-doi", "/viec-lam-da-luu"];
  const pairedLinks = jobSeekerNavLinks.filter((link) => pairedPaths.includes(link.path));
  const remainingLinks = jobSeekerNavLinks.filter((link) => !pairedPaths.includes(link.path));

  return (
    <div
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      style={{ minWidth: "520px" }}
    >
      <div className="px-5 py-5 bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white flex items-center gap-4">
        <Avatar
          size={48}
          src={user.avatarUrl ?? user.avatar ?? undefined}
          icon={<UserOutlined />}
          className="border border-white/60"
        >
          {(!(user.avatarUrl || user.avatar) && user.username)
            ? user.username.charAt(0).toUpperCase()
            : null}
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-lg leading-tight truncate">
            {user.username}
          </p>
          <p className={`text-xs truncate ${user.verified ? "text-white/80" : "text-yellow-100"}`}>
            {user.verified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {overviewLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {link.icon}
              <span>{link.text}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-800 font-semibold text-base">
            <FileDoneOutlined />
            <span>Quản lý công việc của bạn</span>
          </div>
          <div className="flex flex-col gap-2">
            {pairedLinks.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {pairedLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {link.icon}
                    <span className="text-left">{link.text}</span>
                  </NavLink>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {remainingLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {link.icon}
                  <span>{link.text}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-800 font-semibold text-base">
            <FileTextOutlined />
            <span>Quản lý CV</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <NavLink
              to="/cv-cua-toi"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <FileTextOutlined />
              <span>CV của tôi</span>
            </NavLink>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onReport} icon={<CustomerServiceOutlined />} className="w-full">
            Dịch vụ hỗ trợ hệ thống
          </Button>
          <Button danger onClick={onLogout} icon={<LogoutOutlined />} className="w-full">
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const jobSeekerProfile = useAppSelector((state) => state.jobSeekerProfile.profile);
  const jobSeekerProfileLoading = useAppSelector((state) => state.jobSeekerProfile.loading);
  const isJobSeeker = !!user && user.roles.includes(ROLES.JOB_SEEKER);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (isJobSeeker && !jobSeekerProfile && !jobSeekerProfileLoading) {
      dispatch(fetchJobSeekerProfile());
    }
  }, [dispatch, isJobSeeker, jobSeekerProfile, jobSeekerProfileLoading]);

  const displayName =
    user && isJobSeeker ? jobSeekerProfile?.fullName || user.username : user?.username;
  const baseAvatar = user?.avatarUrl ?? user?.avatar ?? undefined;
  const avatarSrc = user && isJobSeeker ? jobSeekerProfile?.profilePicture || baseAvatar : baseAvatar;
  const employerDisplayName = user?.fullName || displayName;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearJobSeekerProfile());
    dispatch(clearEmployerProfile());
    removeAccessToken();
    navigate("/");
    message.success("Đăng xuất thành công!");
  };

  if (isLoginPage) {
    return (
      <header
        className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ height: "68px" }}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <NavLink to="/">
              <img src={LogoColor} alt="Logo" className="h-10" />
            </NavLink>
          </div>
        </div>
      </header>
    );
  }

  if (user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN))) {
    const userDropdownItems = [
      {
        key: "1",
        label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink>,
      },
      {
        key: "system-report",
        label: <span onClick={() => setReportModalOpen(true)}>Dịch vụ hỗ trợ hệ thống</span>,
        icon: <CustomerServiceOutlined />,
      },
      {
        key: "2",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ];

    return (
      <>
      <header
        className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ height: "68px" }}
      >
        <div className="flex items-center">
          <Button
            type="text"
            icon={<MenuOutlined className="text-white text-lg" />}
            onClick={onToggleSidebar}
            className="mr-3"
          />
          <img src={LogoWhite} alt="Logo" className="h-8 mr-4" />
        </div>
        <div className="flex items-center space-x-5">
          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
            <a
              onClick={(e) => e.preventDefault()}
              className="flex items-center space-x-3 text-white hover:text-gray-200"
            >
              <span className="[&_.ant-btn]:text-white [&_.ant-badge-count]:bg-red-500">
                <NotificationDropdown />
              </span>
              <Avatar
                size="small"
                src={avatarSrc}
                icon={!avatarSrc ? <UserOutlined /> : undefined}
                className="bg-blue-600"
              />
              <span className="font-medium">{employerDisplayName}</span>
              <DownOutlined style={{ fontSize: "10px" }} />
            </a>
          </Dropdown>

          <div className="border-l border-blue-700 h-6" />

          
        </div>
      </header>
      <SystemReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      </>
    );
  }

  return (
    <>
    <header
      className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-30"
      style={{ height: "68px" }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <NavLink to="/">
            <img src={LogoColor} alt="Logo" className="h-10" />
          </NavLink>
          <span className="w-2 h-2 rounded-full bg-gray-300" aria-hidden />
        </div>

        <nav className="hidden md:flex items-center space-x-5 ml-4">
          {mainNavLinks.map((link) =>
            link.children ? (
              isJobSeeker ? (
                <div key={link.text} className="relative group">
                  <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium">
                    {link.icon}
                    <span className="ml-2">{link.text}</span>
                    <DownOutlined className="ml-1 text-[10px]" />
                  </button>
                  <div className="absolute left-0 mt-3 w-64 rounded-lg bg-white shadow-lg border border-gray-200 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                    {link.children.map((child: MainNavChild) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-sm"
                      >
                        {child.icon}
                        <span className="ml-2">{child.text}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : null
            ) : (
              <NavLink
                key={link.path}
                to={link.path || "#"}
                className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium"
              >
                {link.icon}
                <span className="ml-2">{link.text}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <NotificationDropdown />
        <Dropdown
          popupRender={() =>
            user ? (
              <UserDropdown
                user={user}
                onLogout={handleLogout}
                onReport={() => setReportModalOpen(true)}
              />
            ) : (
              <GuestDropdown />
            )
          }
          placement="bottomRight"
          trigger={["hover"]}
        >
          <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-gray-600">
            {user ? (
              <Avatar size="large" src={avatarSrc} icon={!avatarSrc ? <UserOutlined /> : undefined} />
            ) : (
              <UserOutlined className="text-2xl" />
            )}
            <span className="font-medium">{user ? displayName : "Tài khoản"}</span>
            <DownOutlined style={{ fontSize: "10px" }} />
          </a>
        </Dropdown>

        <div className="border-l border-gray-300 h-6" />

        {user && user.roles.includes(ROLES.EMPLOYER) && (
          <NavLink
            to="/nha-tuyen-dung/ho-so"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
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

export default Header;

