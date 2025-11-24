import React from 'react';
import { Card, Avatar, Skeleton, Typography, Tag, Descriptions } from 'antd';
import { EnvironmentOutlined, IdcardOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { JobSeekerProfileDto } from '../types';

const { Title, Text } = Typography;

interface ProfileOverviewProps {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  email?: string | null;
}

const genderLabelMap: Record<string, string> = {
  Male: 'Nam',
  Female: 'Nữ',
  Other: 'Khác',
};

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile, loading, email }) => {
  if (loading && !profile) {
    return (
      <Card className="shadow-sm">
        <Skeleton avatar active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="shadow-sm">
        <Text type="secondary">Không tìm thấy hồ sơ của bạn.</Text>
      </Card>
    );
  }

  const genderLabel = profile.gender
    ? genderLabelMap[profile.gender] ?? profile.gender
    : 'Chưa cập nhật';

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Avatar
            size={96}
            src={profile.profilePicture ?? undefined}
            icon={<IdcardOutlined />}
          />
          <div className="text-center md:text-left flex-1">
            <Title level={4} className="mb-1">
              {profile.fullName || 'Người tìm việc'}
            </Title>
            <Tag color="purple" className="mb-2">
              Người tìm việc
            </Tag>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-500">
              <span className="inline-flex items-center gap-1">
                <EnvironmentOutlined />
                {profile.location || 'Chưa cập nhật địa điểm'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Thông tin hồ sơ" className="shadow-sm">
        <Descriptions column={1} bordered={false} size="small">
          <Descriptions.Item label="Họ và tên">
            {profile.fullName || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {genderLabel}
          </Descriptions.Item>
          <Descriptions.Item label="Năm sinh">
            {profile.birthYear || 'Chưa cập nhật'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thông tin liên hệ" className="shadow-sm">
        <Descriptions column={1} bordered={false} size="small">
          <Descriptions.Item label="Email">
            <span className="inline-flex items-center gap-2">
              <MailOutlined />
              {email || 'Chưa cập nhật'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <span className="inline-flex items-center gap-2">
              <PhoneOutlined />
              {profile.contactPhone || 'Chưa cập nhật'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ chi tiết">
            {profile.location || 'Chưa cập nhật'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProfileOverview;
