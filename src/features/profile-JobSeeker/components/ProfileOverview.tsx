import React from "react";
import { Card, Avatar, Typography, Skeleton, Space, Divider } from "antd";
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, IdcardOutlined } from "@ant-design/icons";
import type { JobSeekerProfileDto } from "../types";

const { Title, Text } = Typography;

interface ProfileOverviewProps {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  email?: string | null;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile, loading, email }) => {
  if (loading && !profile) {
    return (
      <Card className="shadow-lg">
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="shadow-lg">
        <Text type="secondary">Chưa có thông tin hồ sơ</Text>
      </Card>
    );
  }

  const contactDetails = [
    {
      key: "email",
      icon: <MailOutlined className="text-indigo-500" />,
      label: "Email",
      value: email || "Chưa cập nhật",
    },
    {
      key: "phone",
      icon: <PhoneOutlined className="text-indigo-500" />,
      label: "Điện thoại",
      value: profile.contactPhone || "Chưa cập nhật",
    },
    {
      key: "location",
      icon: <EnvironmentOutlined className="text-indigo-500" />,
      label: "Địa chỉ",
      value: profile.preferredLocation || "Chưa cập nhật",
    },
  ];

  return (
    <Card className="shadow-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-28" />
      <div className="px-6 pb-6 -mt-12">
        <div className="flex flex-col items-center text-center">
          <Avatar
            size={96}
            src={profile.profilePicture}
            icon={<IdcardOutlined />}
            className="border-4 border-white shadow-lg"
          />
          <Title level={4} className="mt-3 mb-0">
            {profile.fullName || "Người tìm việc"}
          </Title>
          <Text type="secondary">
            {profile.preferredJobType || "Chưa có công việc mong muốn"}
          </Text>
          <Text className="text-sm text-gray-500">
            {profile.preferredLocation || "Chưa cập nhật địa điểm"}
          </Text>
        </div>
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
    </Card>
  );
};

export default ProfileOverview;
