import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, Dropdown, Avatar, Badge, message, Divider } from 'antd';
import {
  UserOutlined,
  BellOutlined,
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
  LockOutlined
} from '@ant-design/icons';
import { FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../features/auth/hooks';
import { ROLES } from '../../constants/roles';
import { logout } from '../../features/auth/slice';
import { removeAccessToken } from '../../services/baseService';
import type { User } from '../../features/auth/types';
import LogoImage from '../../assets/logo.png';

const LogoWhite = LogoImage;
const LogoColor = LogoImage;

interface HeaderProps {
  onToggleSidebar: () => void;
}

const jobSeekerNavLinks = [
  { icon: <UserOutlined />, text: 'Hồ sơ của tôi', path: '/tai-khoan' },
  { icon: <FileDoneOutlined />, text: 'Bài đăng tìm việc của tôi', path: '/quan-ly-bai-dang' },
  { icon: <HeartOutlined />, text: 'Nhà tuyển dụng theo dõi', path: '/nha-tuyen-dung-theo-doi' },
  { icon: <HeartOutlined />, text: 'Bài tuyển dụng đã lưu', path: '/viec-lam-da-luu' },
  { icon: <SendOutlined />, text: 'Bài tuyển dụng đã ứng tuyển', path: '/viec-da-ung-tuyen' },
  { icon: <FileTextOutlined />, text: 'CV của tôi', path: '/cv-cua-toi' }
];

const accountNavLinks = [{ icon: <LockOutlined />, text: 'Đổi mật khẩu', path: '/doi-mat-khau' }];

const mainNavLinks = [
  { icon: <SearchOutlined />, text: 'Danh sách việc làm', path: '/viec-lam' },
  { icon: <BankOutlined />, text: 'Danh sách nhà tuyển dụng', path: '/employer' },
  { icon: <BookOutlined />, text: 'Cẩm nang việc làm', path: '/cam-nang' }
];

const GuestDropdown = () => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '280px' }}>
    <div className="flex justify-between items-center mb-4">
      <NavLink to="/login" className="mr-2">
        <Button type="primary" className="w-full">
          Đăng nhập
        </Button>
      </NavLink>
      <NavLink to="/register">
        <Button className="w-full">Đăng ký</Button>
      </NavLink>
    </div>
    <div className="flex">
      <div className="w-1/3 text-center border-r pr-4">
        <NavLink to="/tai-khoan" className="font-semibold">
          <FaBriefcase className="mx-auto text-4xl text-blue-600 mb-2" />
          My Profile
        </NavLink>
      </div>
      <div className="w-2/3 pl-4">
        <ul>
          {jobSeekerNavLinks.map((link) => (
            <li key={link.path} className="mb-2">
              <NavLink to={link.path} className="flex items-center text-gray-700 hover:text-blue-600">
                {link.icon}
                <span className="ml-2">{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
  isJobSeeker: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, isJobSeeker }) => {
  if (!isJobSeeker) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '260px' }}>
        <div className="pb-3 mb-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar src={(user as any)?.avatarUrl || user.avatar || undefined} icon={<UserOutlined />} />
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-xs text-gray-500">Tài khoản doanh nghiệp</p>
            </div>
          </div>
        </div>
        <Button danger onClick={onLogout} icon={<LogoutOutlined />} className="w-full">
          Đăng xuất
        </Button>
      </div>
    );
  }

  const jobLinks = [
    { text: 'Bài tuyển dụng đã lưu', path: '/viec-lam-da-luu' },
    { text: 'Bài tuyển dụng đã ứng tuyển', path: '/viec-da-ung-tuyen' },
    { text: 'Nhà tuyển dụng theo dõi', path: '/nha-tuyen-dung-theo-doi' },
    { text: 'Bài đăng tìm việc của tôi', path: '/quan-ly-bai-dang' },
  ];

  const cvLinks = [
    { text: 'CV của tôi', path: '/cv-cua-toi' },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden" style={{ minWidth: '500px' }}>
      <div className="px-5 py-5 bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white flex items-center gap-4">
        <Avatar
          size={48}
          src={(user as any)?.avatarUrl || user.avatar || undefined}
          icon={<UserOutlined />}
          className="border border-white/60"
        >
          {(!((user as any)?.avatarUrl || user.avatar) && user.username) ? user.username.charAt(0).toUpperCase() : null}
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-lg leading-tight truncate">{user.username}</p>
          <p className="text-xs text-white/80 truncate">Tài khoản đã xác thực</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-800 font-semibold text-base">
            <FileDoneOutlined />
            <span>Quản lý tìm việc</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {jobLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className="text-base text-slate-700 hover:text-blue-600">
                {link.text}
              </NavLink>
            ))}
          </div>
        </div>

        <Divider className="!my-3" />

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-800 font-semibold text-base">
            <FileTextOutlined />
            <span>Quản lý CV</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {cvLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className="text-base text-slate-700 hover:text-blue-600">
                {link.text}
              </NavLink>
            ))}
          </div>
        </div>

        <Divider className="!my-3" />

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-800 font-semibold text-base">
            <LockOutlined />
            <span>Tài khoản & bảo mật</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <NavLink to="/tai-khoan" className="text-base text-slate-700 hover:text-blue-600">
              Hồ sơ của tôi
            </NavLink>
            <NavLink to="/doi-mat-khau" className="text-base text-slate-700 hover:text-blue-600">
              Đổi mật khẩu
            </NavLink>
          </div>
        </div>

        <Button danger onClick={onLogout} icon={<LogoutOutlined />} className="w-full">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isJobSeeker = !!user && user.roles.includes(ROLES.JOB_SEEKER);

  const handleLogout = () => {
    dispatch(logout());
    removeAccessToken();
    navigate('/');
    message.success('Đăng xuất thành công!');
  };

  if (user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN))) {
    const userDropdownItems = [
      { key: '1', label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink> },
      { key: '2', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout }
    ];

    return (
      <header
        className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
        style={{ height: '68px' }}
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
          <Badge count={0} size="small">
            <BellOutlined className="text-xl text-white" />
          </Badge>

          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
            <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-white hover:text-gray-200">
              <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600" />
              <span className="font-medium">{user.username}</span>
              <DownOutlined style={{ fontSize: '10px' }} />
            </a>
          </Dropdown>

          <div className="border-l border-blue-700 h-6" />

          <NavLink to="/" className="text-white hover:text-gray-200 text-sm font-medium">
            Cho người tìm việc
          </NavLink>
        </div>
      </header>
    );
  }

  return (
    <header
      className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ height: '68px' }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center space-x-4">
          <NavLink to="/">
            <img src={LogoColor} alt="Logo" className="h-12" />
          </NavLink>
          <span className="w-2 h-2 rounded-full bg-gray-400" aria-hidden />
        </div>

        <nav className="hidden md:flex items-center space-x-6 ml-4">
          {mainNavLinks
            .filter((link) => !(link as any).requiresJobSeeker || isJobSeeker)
            .map((link) => (
              <NavLink
                key={link.text}
                to={link.path}
                className="flex items-center text-gray-700 hover:text-blue-600 text-base font-semibold"
              >
                {link.icon}
                <span className="ml-2">{link.text}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <Badge count={0} size="small">
          <BellOutlined className="text-xl" />
        </Badge>
        <Dropdown
          popupRender={() => (user ? <UserDropdown user={user} isJobSeeker={isJobSeeker} onLogout={handleLogout} /> : <GuestDropdown />)}
          placement="bottomRight"
          trigger={['hover']}
        >
          <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-gray-600">
            {user ? (
              <Avatar
                size="large"
                src={(user as any)?.avatarUrl || user.avatar || undefined}
                className="bg-blue-600"
              >
                {(!((user as any)?.avatarUrl || user.avatar) && user.username) ? user.username.charAt(0).toUpperCase() : null}
              </Avatar>
            ) : (
              <Avatar size="large" className="bg-slate-200 text-slate-500" />
            )}
            <span className="font-medium">{user ? user.username : 'Đăng nhập'}</span>
            <DownOutlined style={{ fontSize: '10px' }} />
          </a>
        </Dropdown>

        <div className="border-l border-gray-300 h-6" />

        {location.pathname.startsWith('/nha-tuyen-dung') ? (
          <NavLink to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
            Cho người tìm việc
          </NavLink>
        ) : (
          <NavLink to="/nha-tuyen-dung" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
            Nhà tuyển dụng
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
