import React, { useEffect, useState } from "react";
import { Card, Tabs, Avatar, Tag, Skeleton } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ProfileDetails from "../components/ProfileDetails";
import ProfileOverview from "../components/ProfileOverview";
import { useJobSeekerProfile } from "../hooks/useJobSeekerProfile";
import { useAuth } from "../../auth/hooks";

const JobSeekerProfilePage: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();

  const email = user?.username ? `${user.username}@gmail.com` : undefined;
  const displayName = profile?.fullName || user?.username || "Ứng viên";
  const avatarSrc = profile?.profilePicture || undefined;
  const locationText = profile?.location || "Chưa cập nhật địa chỉ";
  const tabItems = [
    {
      key: "overview",
      label: "Tổng quan",
      children: <ProfileOverview profile={profile} loading={loading} email={email} />,
    },
    {
      key: "edit",
      label: "Chỉnh sửa hồ sơ",
      children: <ProfileDetails profile={profile} loading={loading} error={error} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card className="rounded-2xl shadow-lg border border-blue-50" bodyStyle={{ padding: 20 }}>
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            {loading ? (
              <Skeleton.Avatar active size={96} />
            ) : (
              <Avatar src={avatarSrc} size={96} icon={<UserOutlined />} className="shadow-md" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{displayName}</h1>
                <Tag color="blue" className="rounded-full px-3 py-1">
                  Ứng viên
                </Tag>
              </div>
              <div className="mt-1 text-sm text-slate-600 truncate">{locationText}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <Tag
                  color={user?.verified ? "green" : "orange"}
                  className="rounded-full px-3 py-1"
                >
                  {user?.verified
                    ? "Tài khoản đã xác thực"
                    : "Tài khoản chưa xác thực"}
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-lg" bodyStyle={{ padding: 20 }}>
          <Tabs defaultActiveKey="overview" items={tabItems} />
        </Card>

      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
