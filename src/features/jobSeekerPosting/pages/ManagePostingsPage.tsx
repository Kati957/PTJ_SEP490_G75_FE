import React, { useEffect } from 'react';
import { Button, Typography, List, Spin, Alert, Popconfirm, message, Tag, Empty } from 'antd';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Title level={2} className="!mb-1">Quản lý bài đăng tìm việc</Title>
            <Typography.Paragraph className="!mb-0 text-gray-600">
              Theo dõi, cập nhật và kiểm soát trạng thái các bài đăng của bạn.
            </Typography.Paragraph>
          </div>
          <Link to="/tao-bai-dang-tim-viec">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Tạo bài đăng mới
            </Button>
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-lg p-6">
          {loading || isDeleting ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Lỗi" description={error} type="error" showIcon />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={posts}
              split={false}
              rowKey={(item) => item.jobSeekerPostId}
              locale={{
                emptyText: <Empty description="Chưa có bài đăng nào" />,
              }}
              renderItem={(item, index) => (
                <List.Item className="mb-4 last:mb-0 border border-slate-200 rounded-xl px-6 py-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 w-10 h-10 flex items-center justify-center rounded-full">
                        {index + 1}
                      </div>
                      <div className="space-y-2">
                        <span className="font-semibold text-gray-900 text-base block">{item.title}</span>
                        <Typography.Text type="secondary">
                          {`Ngày tạo: ${format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}`}
                        </Typography.Text>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 md:min-w-[220px]">
                      <Tag
                        color={item.status === 'Active' ? 'green' : 'red'}
                        className="rounded-full px-4 py-1 text-sm min-w-[150px] text-center flex items-center justify-center"
                      >
                        {item.status === 'Active' ? 'Đang hoạt động' : 'Hết hạn'}
                      </Tag>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/xem-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                          <Button type="default">Chi tiết</Button>
                        </Link>
                        <Link to={`/sua-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                          <Button type="primary" ghost>Sửa</Button>
                        </Link>
                        <Popconfirm
                          title="Xóa bài đăng"
                          description="Bạn có chắc chắn muốn xóa bài đăng này không?"
                          onConfirm={() => dispatch(deletePosting(item.jobSeekerPostId))}
                          okText="Xóa"
                          cancelText="Hủy">
                          <Button danger ghost>Xóa</Button>
                        </Popconfirm>
                      </div>
                    </div>
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
