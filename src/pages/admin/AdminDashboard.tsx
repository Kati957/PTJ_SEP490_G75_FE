import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Card, Row, Col, Typography, Button, Space, Tag, message, Spin } from 'antd';
import {
  MenuUnfoldOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
  FileTextOutlined,
  TagsOutlined,
  FlagOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminDashboardService, {
  type AdminDashboardOverview,
  type ManagementSummaryResponse
} from '../../features/admin/services/dashboard.service';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type ManagementKey = 'accounts' | 'posts' | 'categories' | 'reports' | 'news';

interface ManagementItem {
  key: ManagementKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  background: string;
  route?: string;
  summaryEndpoint: string;
  totalLabel: string;
  summaryFields?: Array<{ field: keyof ManagementSummaryResponse; label: string }>;
}

const managementItems: ManagementItem[] = [
  {
    key: 'accounts',
    title: 'Quản lý tài khoản',
    description: 'Giám sát quyền hạn, trạng thái và hoạt động đăng nhập của người dùng.',
    icon: <UserSwitchOutlined />,
    color: '#1677ff',
    background: '#f5f9ff',
    route: '/admin/accounts',
    summaryEndpoint: '/AdminUsers/summary',
    totalLabel: 'Tổng tài khoản',
    summaryFields: [
      { field: 'active', label: 'Đang hoạt động' },
      { field: 'inactive', label: 'Đang khóa' }
    ]
  },
  {
    key: 'posts',
    title: 'Quản lý bài viết',
    description: 'Duyệt, chỉnh sửa và giải quyết các bài tuyển dụng đang chờ phê duyệt.',
    icon: <FileTextOutlined />,
    color: '#722ed1',
    background: '#f5f1ff',
    route: '/admin/job-posts',
    summaryEndpoint: '/AdminPosts/summary',
    totalLabel: 'Tổng bài viết',
    summaryFields: [{ field: 'pending', label: 'Chờ duyệt' }]
  },
  {
    key: 'categories',
    title: 'Quản lý danh mục',
    description: 'Cập nhật cấu trúc danh mục việc làm và kỹ năng trên hệ thống.',
    icon: <TagsOutlined />,
    color: '#08979c',
    background: '#f0fffc',
    route: '/admin/categories',
    summaryEndpoint: '/AdminCategories/summary',
    totalLabel: 'Tổng danh mục'
  },
  {
    key: 'reports',
    title: 'Quản lý báo cáo',
    description: 'Theo dõi báo cáo vi phạm, xử lý khiếu nại và phản hồi người dùng.',
    icon: <FlagOutlined />,
    color: '#f5222d',
    background: '#fff5f3',
    route: '/admin/reports',
    summaryEndpoint: '/AdminReports/summary',
    totalLabel: 'Tổng báo cáo',
    summaryFields: [{ field: 'pending', label: 'Chưa xử lý' }]
  },
  {
    key: 'news',
    title: 'Quản lý tin tức',
    description: 'Đăng tải thông báo, cập nhật tin tức và nội dung marketing.',
    icon: <NotificationOutlined />,
    color: '#fa8c16',
    background: '#fff7e6',
    route: '/admin/news',
    summaryEndpoint: '/AdminNews/summary',
    totalLabel: 'Tổng tin tức',
    summaryFields: [{ field: 'pending', label: 'Bản nháp' }]
  }
];

const overviewFallback: AdminDashboardOverview = {
  totalAccounts: 0,
  totalPosts: 0,
  pendingReports: 0
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [overview, setOverview] = useState<AdminDashboardOverview>(overviewFallback);
  const [summaries, setSummaries] = useState<Record<ManagementKey, ManagementSummaryResponse>>(() =>
    managementItems.reduce((acc, item) => {
      acc[item.key] = { total: 0 };
      return acc;
    }, {} as Record<ManagementKey, ManagementSummaryResponse>)
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        let nextOverview = overviewFallback;
        try {
          const overviewResponse = await adminDashboardService.getOverview();
          nextOverview = overviewResponse;
        } catch (overviewError) {
          console.error('Failed to fetch admin overview', overviewError);
          if (mountedRef.current) {
            message.warning('Không thể tải thống kê tổng quan. Đang hiển thị giá trị mặc định.');
          }
        }

        const summaryResults = await Promise.allSettled(
          managementItems.map((item) => adminDashboardService.getManagementSummary(item.summaryEndpoint))
        );

        if (!mountedRef.current) {
          return;
        }

        setOverview(nextOverview);

        const nextSummaries: Partial<Record<ManagementKey, ManagementSummaryResponse>> = {};
        summaryResults.forEach((result, index) => {
          const key = managementItems[index].key;
          if (result.status === 'fulfilled') {
            nextSummaries[key] = result.value;
          } else {
            console.error(`Failed to fetch summary for ${key}`, result.reason);
          }
        });

        setSummaries((prev) => ({
          ...prev,
          ...nextSummaries
        }));
      } catch (error) {
        console.error('Failed to load admin dashboard data', error);
        if (mountedRef.current) {
          message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchDashboardData();
  }, []);

  const statisticCards = useMemo(
    () => [
      {
        key: 'totalAccounts',
        label: 'Tổng tài khoản',
        value: overview.totalAccounts,
        icon: <UserSwitchOutlined />,
        color: '#1677ff'
      },
      {
        key: 'totalPosts',
        label: 'Tổng bài viết',
        value: overview.totalPosts,
        icon: <FileTextOutlined />,
        color: '#722ed1'
      },
      {
        key: 'pendingReports',
        label: 'Báo cáo chưa xử lý',
        value: overview.pendingReports,
        icon: <FlagOutlined />,
        color: '#f5222d'
      }
    ],
    [overview]
  );

  return (
    <Layout hasSider className="min-h-[calc(100vh-160px)]">
      <Sider
        width={320}
        breakpoint="lg"
        collapsedWidth={0}
        className="!bg-white !shadow-md !p-5 flex flex-col gap-5 overflow-y-auto"
      >
        <Space direction="vertical" size={12} className="w-full">
          {managementItems.map((item) => {
            const summary = summaries[item.key];

            return (
              <Card
                key={item.key}
                hoverable={Boolean(item.route)}
                onClick={() => item.route && navigate(item.route)}
                bodyStyle={{ padding: 16 }}
                className="transition-transform hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderLeft: `4px solid ${item.color}`,
                  background: `linear-gradient(135deg, ${item.background} 0%, #ffffff 140%)`,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)'
                }}
              >
                <Space align="start" size={16}>
                  <Button
                    shape="circle"
                    size="large"
                    icon={item.icon}
                    style={{
                      background: `${item.color}1a`,
                      color: item.color,
                      border: 'none',
                      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Space direction="vertical" size={6} className="flex-1">
                    <Title level={5} className="!mb-0">
                      {item.title}
                    </Title>
                    <Text type="secondary">{item.description}</Text>
                    <Space size={[8, 8]} wrap className="pt-1">
                      <Tag color={item.color}>
                        {item.totalLabel}: {summary?.total?.toLocaleString('vi-VN') ?? '--'}
                      </Tag>
                      {item.summaryFields?.map(({ field, label }) => {
                        const value = summary?.[field];
                        if (value === undefined) {
                          return null;
                        }
                        return (
                          <Tag key={field as string} color="default">
                            {label}: {value.toLocaleString('vi-VN')}
                          </Tag>
                        );
                      })}
                    </Space>
                    {item.route ? (
                      <Button
                        type="link"
                        className="!px-0 !pt-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(item.route!);
                        }}
                      >
                        Truy cập {item.title.toLowerCase()}
                      </Button>
                    ) : (
                      <Text type="secondary" className="pt-2">
                        Trang chi tiết đang được phát triển
                      </Text>
                    )}
                  </Space>
                </Space>
              </Card>
            );
          })}
        </Space>
      </Sider>
      <Layout>
        <Content className="p-6 space-y-6">
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

          <Row gutter={[16, 16]}>
            {statisticCards.map((item) => (
              <Col key={item.key} xs={24} md={8}>
                <Card bordered={false} className="shadow-sm h-full">
                  <Space align="center" size={16}>
                    <Button
                      shape="circle"
                      size="large"
                      icon={item.icon}
                      style={{
                        background: `${item.color}1f`,
                        color: item.color,
                        border: 'none'
                      }}
                    />
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">{item.label}</Text>
                      <Title level={3} className="!mb-0">
                        {loading ? <Spin size="small" /> : item.value.toLocaleString('vi-VN')}
                      </Title>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Card bordered={false} className="shadow-sm">
            <div className="h-64 rounded-lg bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-dashed border-indigo-200 flex flex-col items-center justify-center text-center px-4">
              <Title level={4} className="!mb-2">
                Biểu đồ thống kê sẽ hiển thị tại đây
              </Title>
              <Text type="secondary">
                Kết nối nguồn dữ liệu thật dễ để xem nhanh các chỉ số qua biểu đồ đường, cột hoặc spline.
              </Text>
              <Button type="primary" className="mt-4">
                Kết nối nguồn dữ liệu
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
