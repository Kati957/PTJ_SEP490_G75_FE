import React, { type ReactNode } from 'react';
import { Card, Avatar, Typography, Skeleton, Empty, Rate, Space, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { Profile } from '../../../../types/profile';
import defaultCompanyLogo from '../../../../assets/no-logo.png';

const { Title, Text, Paragraph } = Typography;

interface ProfileHeaderProps {
  profile: Profile | null;
  loading: boolean;
  ratingCount?: number;
  isVerified?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  loading,
  ratingCount = 0,
  isVerified
}) => {
  if (loading) {
    return (
      <Card className="mb-4">
        <Skeleton avatar active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="mb-4">
        <Empty description="Không có thông tin hồ sơ" />
      </Card>
    );
  }

  const initial = profile.displayName?.charAt(0).toUpperCase() ?? 'E';
  const averageRating =
    profile.averageRating ??
    (profile.ratings && profile.ratings.length > 0
      ? profile.ratings.reduce((total, rating) => total + Number(rating.ratingValue ?? 0), 0) /
        profile.ratings.length
      : undefined);

  const contactDetails: Array<{ key: string; icon: ReactNode; label: string; value: ReactNode }> = [
    {
      key: 'contactName',
      icon: <UserOutlined className="text-indigo-500" />,
      label: 'Liên hệ',
      value: profile.contactName
    },
    {
      key: 'email',
      icon: <MailOutlined className="text-indigo-500" />,
      label: 'Email',
      value: profile.contactEmail ?? profile.email
    },
    {
      key: 'phone',
      icon: <PhoneOutlined className="text-indigo-500" />,
      label: 'Điện thoại',
      value: profile.contactPhone ?? profile.phoneNumber
    },
    {
      key: 'address',
      icon: <EnvironmentOutlined className="text-indigo-500" />,
      label: 'Địa chỉ',
      value: profile.address ?? profile.location
    },
    {
      key: 'website',
      icon: <GlobalOutlined className="text-indigo-500" />,
      label: 'Website',
      value: profile.website ? (
        <a href={profile.website} target="_blank" rel="noreferrer">
          {profile.website}
        </a>
      ) : null
    }
  ].filter((item) => Boolean(item.value));

  const avatarSrc =
    profile.avatarUrl ??
    (profile.website && /\.(png|jpe?g|gif|svg|webp)$/i.test(profile.website) ? profile.website : defaultCompanyLogo);

  return (
    <Card className="mb-4 overflow-hidden border-none shadow-md" bodyStyle={{ padding: 0 }}>
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col items-center text-center">
            <Avatar size={96} src={avatarSrc} className="border-4 border-white shadow-lg">
              {initial}
            </Avatar>
            <Title level={3} className="mt-3 mb-0">
              {profile.displayName || 'Nhà tuyển dụng'}
            </Title>
            <Text type="secondary">{profile.location || profile.address || 'Chưa có địa điểm'}</Text>
            <Text className={`text-sm ${isVerified ? 'text-green-600' : 'text-red-500'}`}>
              {isVerified ? 'Tài khoản đã xác thực' : 'Tài khoản chưa xác thực'}
            </Text>
            {averageRating !== undefined && (
              <div className="mt-3 flex flex-col items-center">
                <Rate allowHalf disabled value={Math.round(averageRating * 2) / 2} />
                <Text type="secondary" className="mt-1">
                  {averageRating.toFixed(1)} / 5.0 ({ratingCount} đánh giá)
                </Text>
              </div>
            )}
          </div>
          <Divider />
          <Paragraph className="text-gray-600 text-center">
            {profile.description || 'Chưa có mô tả nhà tuyển dụng'}
          </Paragraph>
          <Divider />
          <Space direction="vertical" size="small" className="w-full">
            {contactDetails.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <Space size="small">
                  {item.icon}
                  <Text strong>{item.label}</Text>
                </Space>
                <Text>{item.value}</Text>
              </div>
            ))}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
