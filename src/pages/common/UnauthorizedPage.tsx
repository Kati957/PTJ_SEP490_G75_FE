import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => (
  <div className="text-center p-10">
    <h1 className="text-3xl font-bold mb-4">403 - Không có quyền truy cập</h1>
    <p className="mb-4">Bạn đã đăng nhập, nhưng không có quyền xem trang này.</p>
    <Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link>
  </div>
);

export default UnauthorizedPage;