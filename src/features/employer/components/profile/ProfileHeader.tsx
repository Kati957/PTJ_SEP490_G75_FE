import React, { type ReactNode, useEffect, useState } from "react";
import { Card, Avatar, Typography, Skeleton, Empty, Space, Divider, Tag } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Profile } from "../../../../types/profile";
import defaultCompanyLogo from "../../../../assets/no-logo.png";
import { useAuth } from "../../../auth/hooks";
import baseService from "../../../../services/baseService";

const { Title, Text, Paragraph } = Typography;

interface ProfileHeaderProps {
  profile: Profile | null;
  loading: boolean;
  isVerified?: boolean;
  locationLabel?: string;
}

type ProfileExtras = Profile & {
  planName?: unknown;
  subscriptionName?: unknown;
  isPremium?: unknown;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, loading, isVerified, locationLabel }) => {
  const { user } = useAuth();
  const [planLabel, setPlanLabel] = useState<string | undefined>(undefined);
  const [planPremium, setPlanPremium] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.id) return;
      try {
        const res = await baseService.get(`/EmployerPost/remaining-posts/${user.id}`);
        const data = (res as { data?: unknown })?.data ?? res;
        const obj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;
        const label = obj?.planName || obj?.plan || obj?.planLevel || obj?.tier || obj?.name || undefined;
        const planIdRaw = obj?.planId ?? obj?.planID ?? undefined;
        const planId = typeof planIdRaw === "string" ? Number(planIdRaw) : planIdRaw;
        const lower = typeof label === "string" ? label.toLowerCase() : "";
        const premium =
          planId === 3 ||
          (typeof planIdRaw === "string" && planIdRaw === "3") ||
          (lower && (lower.includes("premium") || lower.startsWith("pre")));
        setPlanLabel(label ? String(label) : undefined);
        setPlanPremium(Boolean(premium));
      } catch (error) {
        console.error("remaining-posts error", error);
        setPlanPremium(false);
        setPlanLabel(undefined);
      }
    };

    void fetchPlan();
  }, [user?.id]);

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

  const profileExtras = profile as ProfileExtras;
  const planName =
    typeof profileExtras.planName === "string"
      ? profileExtras.planName
      : typeof profileExtras.subscriptionName === "string"
        ? profileExtras.subscriptionName
        : undefined;
  const isPremiumFlag = profileExtras.isPremium === true;
  const locationText = locationLabel || profile.location || profile.address;
  const initial = profile.displayName?.charAt(0).toUpperCase() ?? "E";
  const isPremium =
    planPremium ||
    isPremiumFlag ||
    (planName && planName.toLowerCase().includes("premium")) ||
    (profile.role && profile.role.toLowerCase().includes("premium")) ||
    (profile.role && profile.role.toLowerCase().includes("vip"));

  const contactDetails: Array<{ key: string; icon: ReactNode; label: string; value: ReactNode }> = [
    {
      key: "contactName",
      icon: <UserOutlined className="text-indigo-500" />,
      label: "Liên hệ",
      value: profile.contactName,
    },
    {
      key: "email",
      icon: <MailOutlined className="text-indigo-500" />,
      label: "Email",
      value: profile.contactEmail ?? profile.email,
    },
    {
      key: "phone",
      icon: <PhoneOutlined className="text-indigo-500" />,
      label: "Điện thoại",
      value: profile.contactPhone ?? profile.phoneNumber,
    },
    {
      key: "address",
      icon: <EnvironmentOutlined className="text-indigo-500" />,
      label: "Địa chỉ",
      value: locationText,
    },
    {
      key: "website",
      icon: <GlobalOutlined className="text-indigo-500" />,
      label: "Website",
      value: profile.website ? (
        <a href={profile.website} target="_blank" rel="noreferrer">
          {profile.website}
        </a>
      ) : null,
    },
  ].filter((item) => Boolean(item.value));

  const avatarSrc =
    profile.avatarUrl ??
    (profile.website && /\.(png|jpe?g|gif|svg|webp)$/i.test(profile.website) ? profile.website : defaultCompanyLogo);

  return (
    <div className="relative">
      {isPremium && (
        <>
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-300 animate-premium-blink pointer-events-none" />
          <style>
            {`@keyframes premium-blink {
              0% { opacity: 0.45; box-shadow: 0 0 0 0 rgba(251,191,36,0.35); }
              50% { opacity: 1; box-shadow: 0 0 0 10px rgba(251,191,36,0.15); }
              100% { opacity: 0.45; box-shadow: 0 0 0 0 rgba(251,191,36,0.35); }
            }
            .animate-premium-blink { animation: premium-blink 2.6s ease-in-out infinite; }
            @keyframes premium-avatar {
              0% { box-shadow: 0 0 0 0 rgba(251,191,36,0.45); }
              50% { box-shadow: 0 0 0 14px rgba(251,191,36,0); }
              100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
            }
            .animate-premium-avatar { animation: premium-avatar 2.2s ease-out infinite; }`}
          </style>
        </>
      )}
      <Card
        className={`mb-4 overflow-hidden relative ${
          isPremium ? "border-2 border-amber-200 shadow-lg ring-2 ring-amber-100/80" : "border-none shadow-md"
        }`}
        bodyStyle={{ padding: 0 }}
      >
        <div className="relative">
          <div
            className={`h-32 bg-gradient-to-r ${
              isPremium ? "from-amber-400 via-orange-500 to-pink-500" : "from-indigo-500 via-purple-500 to-pink-500"
            }`}
          />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col items-center text-center">
              <div className={isPremium ? "rounded-full animate-premium-avatar" : ""}>
                <Avatar
                  size={96}
                  src={avatarSrc}
                  className={`border-4 ${isPremium ? "border-amber-100 ring-2 ring-amber-200" : "border-white"} shadow-lg`}
                >
                  {initial}
                </Avatar>
              </div>
              <div className="flex items-center gap-2 mt-3 mb-0">
                <Title
                  level={3}
                  className={`mb-0 ${
                    isPremium
                      ? "bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow"
                      : ""
                  }`}
                >
                  {profile.displayName || "Nhà tuyển dụng"}
                </Title>
                {isPremium && (
                  <Tag color="gold" className="font-semibold">
                    {(planLabel || planName || "PREMIUM").toString().toUpperCase()}
                  </Tag>
                )}
              </div>
              <Text type="secondary">{locationText || "Chưa có địa điểm"}</Text>
              <Text className={`text-sm ${isVerified ? "text-green-600" : "text-red-500"}`}>
                {isVerified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"}
              </Text>
            </div>
            <Divider />
            <Paragraph className="text-gray-600 text-center">
              {profile.description || "Chưa có mô tả nhà tuyển dụng"}
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
    </div>
  );
};

export default ProfileHeader;
