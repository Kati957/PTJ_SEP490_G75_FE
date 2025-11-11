import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { Button, Dropdown, Avatar, Badge, message } from 'antd';
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
  FileDoneOutlined
} from '@ant-design/icons';
import { FaBriefcase } from 'react-icons/fa';
import { ROLES } from '../../constants/roles';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/slice';
import { removeAccessToken } from '../../services/baseService';

const LogoWhite = '/vite.svg';
const LogoColor = '/vite.svg';

interface HeaderProps {
  onToggleSidebar: () => void;
}

// Các link trong dropdown của Job Seeker
const jobSeekerNavLinks = [
  {
    icon: <FileDoneOutlined />,
    text: 'Việc đã đăng',
    path: '/quan-ly-bai-dang'
  },
  {
    icon: <HeartOutlined />,
    text: 'Việc đã lưu',
    path: '/viec-lam-da-luu'
  },
  {
    icon: <SendOutlined />,
    text: 'Việc đã ứng tuyển',
    path: '/viec-da-ung-tuyen'
  },
  {
    icon: <BellOutlined />,
    text: 'Thông báo việc làm',
    path: '/thong-bao-viec-lam'
  }
];

// Các link chính trên header
const mainNavLinks = [
  {
    icon: <SearchOutlined />,
    text: 'Ngành nghề/Địa điểm',
    path: '/viec-lam'
  },
  {
    icon: <BankOutlined />,
    text: 'Nhà tuyển dụng',
    path: '/employer'
  },
  {
    icon: <BookOutlined />,
    text: 'Cẩm nang việc làm',
    path: '/cam-nang'
  },
  {
    icon: <FileTextOutlined />,
    text: 'Mẫu CV Xin Việc',
    path: '/mau-cv'
  }
];

// Dropdown cho guest
const GuestDropdown = () => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '450px' }}>
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
    <div className="flex">
      <div className="w-1/3 text-center border-r pr-4">
        
        <NavLink to="/dashboard-jobseeker"className="font-semibold"><FaBriefcase className="mx-auto text-4xl text-blue-600 mb-2" />My PTJ</NavLink>
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

// Dropdown cho user đã login
const UserDropdown = ({ user, onLogout }) => (
  <div className="p-4 bg-white shadow-md rounded-lg" style={{ minWidth: '450px' }}>
    <div className="flex">
      <div className="w-1/3 text-center border-r pr-4">
        <NavLink to="/dashboard-jobseeker"className="font-semibold"><FaBriefcase className="mx-auto text-4xl text-blue-600 mb-2" />My PTJ</NavLink>
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
    <div className="border-t mt-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <NavLink to="/tai-khoan">
          <div className="flex items-center">
            <Avatar icon={<UserOutlined />} src={user.avatar} />
            <span className="ml-2 font-semibold">{user.username}</span>
          </div>
        </NavLink>
      </div>
      <Button danger onClick={onLogout} icon={<LogoutOutlined />} className="w-full">
        Đăng xuất
      </Button>
    </div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    removeAccessToken();
    navigate('/');
    message.success('Đăng xuất thành công!');
  };

  if (user && (user.roles.includes(ROLES.EMPLOYER) || user.roles.includes(ROLES.ADMIN))) {
    // Header cho Employer và Admin (giữ nguyên)
    const userDropdownItems = [
      {
        key: '1',
        label: <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ của tôi</NavLink>
      },
      {
        key: '2',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout
      }
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

          <div className="border-l border-blue-700 h-6"></div>

          <NavLink to="/" className="text-white hover:text-gray-200 text-sm font-medium">
            Cho Người tìm việc
          </NavLink>
        </div>
      </header>
    );
  }

  // Header cho Job Seeker và Guest
  return (
    <header
      className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10"
      style={{ height: '68px' }}
    >
      <div className="flex items-center justify-between ">
        <NavLink to="/">
          <img src={LogoColor} alt="Logo" className="h-10 mr-6" /> 
        </NavLink>
              
      </div>

      <div className="flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-6">
          {mainNavLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              {link.icon}
              <span className="ml-2">{link.text}</span>
            </NavLink>
          ))}
        </nav>
        <Badge count={0} size="small">
          <BellOutlined className="text-xl" />
        </Badge>
        <Dropdown
          popupRender={() =>
            user ? <UserDropdown user={user} onLogout={handleLogout} /> : <GuestDropdown />
          }
          placement="bottomRight"
          trigger={['hover']}
        >
          <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-gray-600">
            {user ? (
              <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
            ) : (
              <UserOutlined className="text-2xl" />
            )}
            <span className="font-medium">{user ? user.username : 'Đăng nhập'}</span>
            <DownOutlined style={{ fontSize: '10px' }} />
          </a>
        </Dropdown>

        <div className="border-l border-gray-300 h-6"></div>

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
