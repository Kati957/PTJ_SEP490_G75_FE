import React, { useEffect } from 'react';
import { List, Card, Typography, Spin, Alert, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { AppDispatch, RootState } from '../../../app/store';
import { fetchAllJobSeekerPosts } from '../slice';
import { UserOutlined, EnvironmentOutlined, TagOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const JobSeekerPostListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.jobSeekerPostList);

  useEffect(() => {
    dispatch(fetchAllJobSeekerPosts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon className="m-8" />;
  }

  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="mb-6">Danh sách ứng viên tìm việc</Title>
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <Link to={`/xem-bai-dang-tim-viec/${post.jobSeekerPostId}`}>
                <Card hoverable className="h-full flex flex-col">
                  <Card.Meta
                    title={<span className="text-blue-600">{post.title}</span>}
                    description={
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <Text type="secondary"><UserOutlined className="mr-2" />{post.seekerName}</Text><br />
                          <Text type="secondary"><EnvironmentOutlined className="mr-2" />{post.preferredLocation}</Text>
                        </div>
                        <div className="mt-4">
                          <Tag icon={<TagOutlined />} color="blue">{post.categoryName}</Tag>
                        </div>
                      </div>
                    }
                  />
                  <div className="mt-4 text-right text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                  </div>
                </Card>
              </Link>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default JobSeekerPostListPage;
