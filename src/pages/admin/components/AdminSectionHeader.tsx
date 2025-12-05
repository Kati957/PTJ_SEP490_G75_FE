import React from 'react';
import { Card, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  gradient?: string;
}

export const AdminSectionHeader: React.FC<AdminSectionHeaderProps> = ({
  title,
  description,
  extra,
  gradient = 'from-indigo-500 via-purple-500 to-pink-500'
}) => {
  return (
    <Card
      variant="borderless"
      className={`shadow-md mb-4 border-0 text-white bg-gradient-to-r ${gradient}`}
      styles={{ body: { padding: '24px' } }}
    >
      <Space className="w-full flex justify-between" align="start">
        <Space direction="vertical" size={4} className="text-white">
          <Title level={3} className="!mb-0 !text-white drop-shadow-sm">
            {title}
          </Title>
          {description && (
            <Paragraph className="!mb-0 !text-white/80">{description}</Paragraph>
          )}
        </Space>
        {extra}
      </Space>
    </Card>
  );
};

export default AdminSectionHeader;
