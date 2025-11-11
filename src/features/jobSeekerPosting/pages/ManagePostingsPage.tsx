import React, { useEffect } from 'react';
import { Button, Typography, List, Spin, Alert, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks';
import type { AppDispatch, RootState } from '../../../app/store';
import { fetchPostsByUserId } from '../slice/managePostSlice';
import { deletePosting, resetPostStatus } from '../slice/slice';
import { format } from 'date-fns';

const { Title } = Typography;

const ManagePostingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { posts, loading, error } = useSelector((state: RootState) => state.jobSeekerPosting.manage);
  const { loading: isDeleting, success: deleteSuccess, error: deleteError } = useSelector((state: RootState) => state.jobSeekerPosting.create.delete);

  useEffect(() => {
    if (user) {
      dispatch(fetchPostsByUserId(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (deleteSuccess) {
      message.success('Xóa bài đăng thành công!');
      dispatch(resetPostStatus());
      if (user) {
        dispatch(fetchPostsByUserId(user.id)); // Tải lại danh sách bài đăng
      }
    }
    if (deleteError) {
      message.error(`Xóa thất bại: ${deleteError}`);
      dispatch(resetPostStatus());
    }
  }, [deleteSuccess, deleteError, dispatch, user]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Quản lý bài đăng tìm việc</Title>
          <Link to="/tao-bai-dang-tim-viec">
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo bài đăng mới
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading || isDeleting ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Lỗi" description={error} type="error" showIcon />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={posts}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Link to={`/sua-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                      <Button type="link">Sửa</Button>
                    </Link>,
                    <Popconfirm
                      title="Xóa bài đăng"
                      description="Bạn có chắc chắn muốn xóa bài đăng này không?"
                      onConfirm={() => dispatch(deletePosting(item.jobSeekerPostId))}
                      okText="Xóa"
                      cancelText="Hủy">
                      <Button type="link" danger>Xóa</Button>
                    </Popconfirm>,
                  ]}
                >
                  <div className="mr-4 text-gray-500 font-medium">{index + 1}.</div>
                  <List.Item.Meta
                    title={<Link to={`/xem-bai-dang-tim-viec/${item.jobSeekerPostId}`}>{item.title}</Link>}
                    description={`Ngày tạo: ${format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}`}
                  />
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status === 'Active' ? 'Đang hoạt động' : 'Hết hạn'}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePostingsPage;
