import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Row,
  Col,
  Card,
  Tabs,
  Descriptions,
  List,
  Rate,
  Typography,
  Space,
  Empty,
  Tag
} from 'antd';
import type { TabsProps } from 'antd';
import type { AppDispatch, RootState } from '../../app/store';
import {
  fetchEmployerProfile,
  updateEmployerProfile,
  deleteEmployerAvatar
} from '../../features/employer/slice/profileSlice';
import ProfileHeader from '../../features/employer/components/profile/ProfileHeader';
import ProfileForm from '../../features/employer/components/profile/ProfileForm';
import type { ProfileUpdateRequest, Rating } from '../../types/profile';

const { Title, Paragraph, Text } = Typography;

const EmployerProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const authUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    void dispatch(fetchEmployerProfile());
  }, [dispatch]);

  const handleUpdateProfile = async (data: ProfileUpdateRequest) => {
    await dispatch(updateEmployerProfile(data)).unwrap();
  };

  const handleDeleteAvatar = async () => {
    await dispatch(deleteEmployerAvatar()).unwrap();
  };

  const ratings: Rating[] = profile?.ratings ?? [];
  const computeAverage = (items: Rating[]) =>
    items.length > 0
      ? items.reduce((total, current) => total + Number(current.ratingValue ?? 0), 0) / items.length
      : undefined;
  const ratingAverage = profile?.averageRating ?? computeAverage(ratings);
  const ratingCount = ratings.length;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const overviewTab = profile ? (
    <div className="space-y-4">
      <Card title="Thong tin nha tuyen dung" bordered={false} className="shadow-sm">
        <Descriptions column={1} labelStyle={{ fontWeight: 600, width: 160 }}>
          <Descriptions.Item label="Ten nha tuyen dung">{profile.displayName}</Descriptions.Item>
          <Descriptions.Item label="Mo ta">
            {profile.description || 'Chua co mo ta'}
          </Descriptions.Item>
          <Descriptions.Item label="Nguoi lien he">
            {profile.contactName || 'Chua cap nhat'}
          </Descriptions.Item>
          <Descriptions.Item label="Vai tro">
            <Tag color="purple">{profile.role || 'Employer'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thong tin lien he" bordered={false} className="shadow-sm">
        <Descriptions column={2} labelStyle={{ fontWeight: 600 }}>
          <Descriptions.Item label="Email">
            {profile.contactEmail ?? profile.email ?? 'Chua cap nhat'}
          </Descriptions.Item>
          <Descriptions.Item label="So dien thoai">
            {profile.contactPhone ?? profile.phoneNumber ?? 'Chua cap nhat'}
          </Descriptions.Item>
          <Descriptions.Item label="Website">
            {profile.website ? (
              <a href={profile.website} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            ) : (
              'Chua cap nhat'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Dia diem">
            {profile.location ?? 'Chua cap nhat'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  ) : (
    <Empty description="Chua co thong tin ho so" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Tong quan',
      children: overviewTab
    },
    {
      key: 'edit',
      label: 'Chinh sua ho so',
      children: (
        <ProfileForm
          profile={profile}
          loading={loading}
          onSubmit={handleUpdateProfile}
          onDeleteAvatar={handleDeleteAvatar}
        />
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <Alert message="Loi" description={error} type="error" showIcon className="mb-4" />}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <ProfileHeader
            profile={profile}
            loading={loading}
            ratingCount={ratingCount}
            isVerified={authUser?.verified}
          />

          <Card
            title="Danh gia nha tuyen dung"
            bordered={false}
            className="shadow-md"
            bodyStyle={{ paddingTop: 16 }}
          >
            {ratings.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={ratings}
                split={false}
                renderItem={(item) => (
                  <List.Item key={item.ratingId} className="bg-gray-50 rounded-lg px-4 py-3 mb-3">
                    <Space direction="vertical" size={4} className="w-full">
                      <Space align="center" className="justify-between">
                        <Text strong>{item.raterName ?? `Nguoi dung ${item.raterId}`}</Text>
                        <Text type="secondary">{formatDate(item.createdAt)}</Text>
                      </Space>
                      <Space align="center">
                        <Rate allowHalf disabled value={Number(item.ratingValue)} />
                        <Text strong>{Number(item.ratingValue).toFixed(1)}</Text>
                      </Space>
                      <Paragraph className="mb-0">
                        {item.comment ?? 'Khong co nhan xet.'}
                      </Paragraph>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Chua co danh gia" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-md"
            title={
              <div className="flex items-center justify-between">
                <Title level={4} className="mb-0">
                  Thong tin ho so
                </Title>
                {ratingAverage !== undefined && (
                  <Space size="small" align="center">
                    <Rate allowHalf disabled value={Math.round(ratingAverage * 2) / 2} />
                    <Text strong>{ratingAverage.toFixed(1)} / 5</Text>
                  </Space>
                )}
              </div>
            }
          >
            <Tabs defaultActiveKey="overview" items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployerProfilePage;
