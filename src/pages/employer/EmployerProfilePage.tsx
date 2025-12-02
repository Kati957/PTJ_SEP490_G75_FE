import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Row,
  Col,
  Card,
  Tabs,
  Descriptions,
  Typography,
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
import type { ProfileUpdateRequest } from '../../types/profile';
import locationService from '../../features/location/locationService';

const { Title } = Typography;

const EmployerProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [resolvedLocation, setResolvedLocation] = useState('');

  useEffect(() => {
    void dispatch(fetchEmployerProfile());
  }, [dispatch]);

  const handleUpdateProfile = async (data: ProfileUpdateRequest) => {
    await dispatch(updateEmployerProfile(data)).unwrap();
  };

  const handleDeleteAvatar = async () => {
    await dispatch(deleteEmployerAvatar()).unwrap();
  };

  useEffect(() => {
    let cancelled = false;

    const resolveLocation = async () => {
      if (!profile) {
        if (!cancelled) {
          setResolvedLocation('');
        }
        return;
      }

      if (profile.location) {
        if (!cancelled) {
          setResolvedLocation(profile.location);
        }
        return;
      }

      const parts: string[] = [];
      if (profile.fullLocation) {
        parts.push(profile.fullLocation);
      }

      try {
        if (profile.districtId && profile.wardId) {
          const wards = await locationService.getWards(profile.districtId);
          const wardName = wards.find((ward) => ward.code === profile.wardId)?.name;
          if (wardName) {
            parts.push(wardName);
          }
        }

        if (profile.provinceId && profile.districtId) {
          const districts = await locationService.getDistricts(profile.provinceId);
          const districtName = districts.find((district) => district.code === profile.districtId)?.name;
          if (districtName) {
            parts.push(districtName);
          }
        }

        if (profile.provinceId) {
          const provinces = await locationService.getProvinces();
          const provinceName = provinces.find((province) => province.code === profile.provinceId)?.name;
          if (provinceName) {
            parts.push(provinceName);
          }
        }
      } catch (error) {
        console.error('Failed to resolve employer location', error);
      }

      if (!cancelled) {
        setResolvedLocation(parts.join(', '));
      }
    };

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const overviewTab = profile ? (
    <div className="space-y-4">
      <Card title="Thông tin nhà tuyển dụng" bordered={false} className="shadow-sm">
        <Descriptions column={1} labelStyle={{ fontWeight: 600, width: 160 }}>
          <Descriptions.Item label="Tên nhà tuyển dụng">{profile.displayName}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            {profile.description || 'Chưa có mô tả'}
          </Descriptions.Item>
          <Descriptions.Item label="Người liên hệ">
            {profile.contactName || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color="purple">{profile.role || 'Nhà tuyển dụng'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thông tin liên hệ" bordered={false} className="shadow-sm">
        <Descriptions column={2} labelStyle={{ fontWeight: 600 }}>
          <Descriptions.Item label="Email">
            {profile.contactEmail ?? profile.email ?? 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {profile.contactPhone ?? profile.phoneNumber ?? 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Website">
            {profile.website ? (
              <a href={profile.website} target="_blank" rel="noreferrer">
                {profile.website}
              </a>
            ) : (
              'Chưa cập nhật'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Địa điểm">
            {resolvedLocation || 'Chưa cập nhật'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  ) : (
    <Empty description="Chưa có thông tin hồ sơ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Tổng quan',
      children: overviewTab
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa hồ sơ',
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
      {error && <Alert message="Lỗi" description={error} type="error" showIcon className="mb-4" />}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <ProfileHeader
            profile={profile}
            loading={loading}
            isVerified={authUser?.verified}
            locationLabel={resolvedLocation}
          />
        </Col>

        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-md"
            title={
              <div className="flex items-center justify-between">
                <Title level={4} className="mb-0">
                  Thông tin hồ sơ
                </Title>
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
