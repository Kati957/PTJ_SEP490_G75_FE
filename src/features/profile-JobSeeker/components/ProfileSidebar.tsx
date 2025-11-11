import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { NavLink, useLocation } from 'react-router-dom';

const ProfileSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Menu
        mode="vertical"
        selectedKeys={[location.pathname]}
        style={{ borderRight: 0 }}
      >
        <Menu.Item key="/tai-khoan" icon={<UserOutlined />}>
          <NavLink to="/tai-khoan">
            <span className="font-semibold">Tài khoản</span>
            <div className="text-xs text-gray-500">Tùy chỉnh thông tin cá nhân</div>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/doi-mat-khau" icon={<LockOutlined />}>
          <NavLink to="/doi-mat-khau">
            <span className="font-semibold">Đổi mật khẩu</span>
            <div className="text-xs text-gray-500">Đổi mật khẩu đăng nhập</div>
          </NavLink>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default ProfileSidebar;
