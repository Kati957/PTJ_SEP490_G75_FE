import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Typography, Button, Space, message, Spin } from "antd";
import { SettingOutlined, BarChartOutlined, UserSwitchOutlined, FileTextOutlined, FlagOutlined } from "@ant-design/icons";
import adminDashboardService, { type AdminDashboardOverview } from "../../features/admin/services/dashboard.service";

const { Title, Text } = Typography;

const overviewFallback: AdminDashboardOverview = {
  totalAccounts: 0,
  totalPosts: 0,
  pendingReports: 0,
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<AdminDashboardOverview>(overviewFallback);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const overviewResponse = await adminDashboardService.getOverview();
        if (mountedRef.current) {
          setOverview(overviewResponse ?? overviewFallback);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
        if (mountedRef.current) {
          message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchOverview();
  }, []);

  const statisticCards = useMemo(
    () => [
      {
        key: "totalAccounts",
        label: "Tổng tài khoản",
        value: overview.totalAccounts,
        icon: <UserSwitchOutlined />,
        color: "#1677ff",
      },
      {
        key: "totalPosts",
        label: "Tổng bài viết",
        value: overview.totalPosts,
        icon: <FileTextOutlined />,
        color: "#722ed1",
      },
      {
        key: "pendingReports",
        label: "Báo cáo chưa xử lý",
        value: overview.pendingReports,
        icon: <FlagOutlined />,
        color: "#f5222d",
      },
    ],
    [overview],
  );

  return (
    <div className="space-y-6">
      <Card
        bordered={false}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg"
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size={10} className="w-full">
          <span className="inline-flex items-center gap-2 text-sm text-white/90">
            <SettingOutlined />
            Admin Control Center
          </span>
          <Title level={3} className="!text-white !mb-0">
            Chào mừng trở lại, quản trị viên
          </Title>
          <Text className="!text-white/80">
            Theo dõi hoạt động hệ thống, xử lý báo cáo và quản lý nội dung chỉ với vài thao tác.
          </Text>
          <Space className="flex flex-wrap gap-4 pt-2">
            <Button type="primary" ghost icon={<BarChartOutlined />}>
              Xem báo cáo tổng quan
            </Button>
            <Button ghost>Thiết lập nhanh</Button>
          </Space>
        </Space>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statisticCards.map((item) => (
          <Card key={item.key} bordered={false} className="shadow-sm h-full">
            <Space align="center" size={16}>
              <Button
                shape="circle"
                size="large"
                icon={item.icon}
                style={{
                  background: `${item.color}1f`,
                  color: item.color,
                  border: "none",
                }}
              />
              <Space direction="vertical" size={2}>
                <Text type="secondary">{item.label}</Text>
                <Title level={3} className="!mb-0">
                  {loading ? <Spin size="small" /> : item.value.toLocaleString("vi-VN")}
                </Title>
              </Space>
            </Space>
          </Card>
        ))}
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="h-64 rounded-lg bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-dashed border-indigo-200 flex flex-col items-center justify-center text-center px-4">
          <Title level={4} className="!mb-2">
            Biểu đồ thống kê sẽ hiển thị tại đây
          </Title>
          <Text type="secondary">
            Kết nối nguồn dữ liệu thật để xem nhanh các chỉ số qua biểu đồ đường, cột hoặc spline.
          </Text>
          <Button type="primary" className="mt-4">
            Kết nối nguồn dữ liệu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

