import React from 'react';
import { Card, Skeleton, Typography, Descriptions } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { JobSeekerProfileDto } from '../types';

const { Text } = Typography;

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
  const birthYearText = profile.birthYear && profile.birthYear > 0 ? profile.birthYear : 'Chưa cập nhật';

  return (
    <div className="space-y-4">
      <Card title="Thông tin hồ sơ" className="shadow-sm">
        <Descriptions column={1} bordered={false} size="small">
          <Descriptions.Item label="Họ và tên">
            {profile.fullName || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {genderLabel}
          </Descriptions.Item>
          <Descriptions.Item label="Năm sinh">
            {birthYearText}
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
          {/* Địa chỉ chi tiết đã bỏ hiển thị */}
        </Descriptions>
      </Card>
    </div>
  );
};

export default ProfileOverview;
