import React from "react";
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
  const gradientBg =
    "linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(14,165,233,0.12) 40%, rgba(16,185,129,0.14) 100%)";
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
      <div
        className="relative overflow-hidden border border-blue-100/60 bg-white rounded-3xl shadow-xl"
        style={{ backgroundImage: gradientBg }}
      >
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -right-16 top-6 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            {loading ? (
              <Skeleton.Avatar active size={100} className="shadow-md" />
            ) : (
              <Avatar
                src={avatarSrc}
                size={100}
                icon={<UserOutlined />}
                className="shadow-lg ring-4 ring-white"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{displayName}</h1>
                <Tag color="blue" className="rounded-full px-3 py-1 text-xs font-semibold">
                  Ứng viên
                </Tag>
              </div>
              <div className="mt-1 text-sm text-slate-700 truncate">{locationText}</div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                <Tag
                  color={user?.verified ? "green" : "orange"}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                >
                  {user?.verified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"}
                </Tag>
                {email && (
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-700 border border-slate-100 shadow-sm">
                    {email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4">
        <Card
          className="rounded-3xl shadow-lg border border-slate-100"
          styles={{ body: { padding: 20 } }}
        >
          <Tabs
            defaultActiveKey="overview"
            items={tabItems}
            className="profile-tabs"
            tabBarGutter={12}
          />
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
