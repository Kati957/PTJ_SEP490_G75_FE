import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { Button, Dropdown, Avatar, Badge } from 'antd';
import { 
  UserOutlined, 
  BellOutlined, 
  DownOutlined,
  LogoutOutlined,
  MenuOutlined
} from '@ant-design/icons';

const LogoWhite = '/vite.svg';
const LogoColor = '/vite.svg';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {  const { user } = useAuth();
  const location = useLocation();

  const userMenuItems = [
    {
      key: '1',
      label: (
        <NavLink to="/nha-tuyen-dung/ho-so">Hồ sơ công ty</NavLink>
      )
    },
    {
      key: '2',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => { 
        console.log('Logging out...');
      }
    }
  ];

  const guestMenuItems = [
    { key: '1', label: <NavLink to="/login">Đăng nhập</NavLink> },
    { key: '2', label: <NavLink to="/register">Đăng ký</NavLink> }
  ];

  if (user) {
    return (
      <header className="bg-blue-900 text-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10" style={{ height: '68px' }}>
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

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <a onClick={(e) => e.preventDefault()} className="flex items-center space-x-2 text-white hover:text-gray-200">
              <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600" />
              <span className="font-medium">{user.name}</span>
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

  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10" style={{ height: '68px' }}>
      <div className="flex items-center">
        <img src={LogoColor} alt="Logo" className="h-8 mr-4" />
      </div>
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <Dropdown menu={{ items: guestMenuItems }} placement="bottomRight">
            <Button type="default" icon={<UserOutlined />}>
              Đăng ký
            </Button>
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
      </div>
    </header>
  );
};

export default Header;