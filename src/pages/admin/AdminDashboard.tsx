import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import {
  BarChartOutlined,
  DollarOutlined,
  FileTextOutlined,
  FlagOutlined,
  LineChartOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, List, Progress, Segmented, Space, Statistic, Tag, Typography, message } from "antd";
import adminDashboardService, {
  type AdminDashboardSummary,
  type JobCategoryStat,
  type PostTimeStat,
  type RevenueByPlanStat,
  type RevenueSummary,
  type RevenueTimeStat,
  type SubscriptionStats,
  type TimeMode,
  type TopEmployerStat,
  type UserTimeStat,
} from "../../features/admin/services/dashboard.service";

const { Title, Text } = Typography;

type TrendGroup = "users" | "posts" | "revenue";

const fallbackSeries = (mode: TimeMode, points = 6) => {
  const now = new Date();
  const result: { label: string; value: number }[] = [];
  for (let i = points - 1; i >= 0; i -= 1) {
    if (mode === "day") {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      result.push({ label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), value: 0 });
    } else if (mode === "month") {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      result.push({ label: `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`, value: 0 });
    } else {
      result.push({ label: String(now.getFullYear() - i), value: 0 });
    }
  }
  return result;
};

const formatNumber = (value?: number | null, fallback = "0") => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value.toLocaleString("vi-VN");
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    typeof value === "number" && !Number.isNaN(value) ? value : 0,
  );

const AdminDashboard: React.FC = () => {
  const panelClass = "shadow-lg border-0 bg-white/90 backdrop-blur";
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);

  const [userStats, setUserStats] = useState<UserTimeStat[]>([]);
  const [postStats, setPostStats] = useState<PostTimeStat[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueTimeStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<JobCategoryStat[]>([]);
  const [topEmployers, setTopEmployers] = useState<TopEmployerStat[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlanStat[]>([]);
  const [trendSize, setTrendSize] = useState({ width: 960, height: 360 });
  const [barSize, setBarSize] = useState({ width: 960, height: 320 });

  const [timeMode, setTimeMode] = useState<TimeMode>("month");
  const [trendGroup, setTrendGroup] = useState<TrendGroup>("users");
  const [, setLoadingTrends] = useState(false);
  const [, setLoadingStatic] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const mounted = useRef(true);
  const loadedOverviewRef = useRef(false);
  const loadedStaticRef = useRef(false);
  const fetchingOverviewRef = useRef(false);
  const fetchingStaticRef = useRef(false);
  const fetchingTrendsRef = useRef(false);
  const lastUsersRef = useRef<UserTimeStat[]>([]);
  const lastPostsRef = useRef<PostTimeStat[]>([]);
  const lastRevenueRef = useRef<RevenueTimeStat[]>([]);
  const trendContainerRef = useRef<HTMLDivElement | null>(null);
  const barContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (trendContainerRef.current) {
        const w = Math.max(trendContainerRef.current.clientWidth, 320);
        setTrendSize({ width: w, height: trendSize.height });
      }
      if (barContainerRef.current) {
        const w = Math.max(barContainerRef.current.clientWidth, 320);
        setBarSize({ width: w, height: barSize.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [trendSize.height, barSize.height]);

  useEffect(() => {
    const loadOverview = async () => {
      if (loadedOverviewRef.current || fetchingOverviewRef.current) return;
      fetchingOverviewRef.current = true;
      try {
        const [s, r, subs] = await Promise.all([
          adminDashboardService.getSummary(),
          adminDashboardService.getRevenueSummary(),
          adminDashboardService.getSubscriptionStats(),
        ]);
        if (!mounted.current) return;
        setSummary(s);
        setRevenueSummary(r);
        setSubscriptionStats(subs);
        loadedOverviewRef.current = true;
      } catch {
        if (mounted.current) message.error("Không tải được dữ liệu tổng quan.");
      } finally {
        fetchingOverviewRef.current = false;
      }
    };
    void loadOverview();
  }, [refreshTick]);

  useEffect(() => {
    const loadTrends = async () => {
      if (fetchingTrendsRef.current) return;
      fetchingTrendsRef.current = true;
      setLoadingTrends(true);
      try {
        const [users, posts, revenues] = await Promise.all([
          adminDashboardService.getUserStats(timeMode),
          adminDashboardService.getPostStats(timeMode),
          adminDashboardService.getRevenueStats(timeMode),
        ]);
        if (!mounted.current) return;
        lastUsersRef.current = users;
        lastPostsRef.current = posts;
        lastRevenueRef.current = revenues;
        setUserStats(users);
        setPostStats(posts);
        setRevenueStats(revenues);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        const status = axiosErr?.response?.status;
        const msg = status ? `${status} khi tải biểu đồ.` : "Không tải được dữ liệu biểu đồ.";
        if (mounted.current) message.error(msg);
      } finally {
        if (mounted.current) setLoadingTrends(false);
        fetchingTrendsRef.current = false;
      }
    };
    void loadTrends();
  }, [timeMode, refreshTick]);

  useEffect(() => {
    const loadStatic = async () => {
      if (loadedStaticRef.current || fetchingStaticRef.current) return;
      fetchingStaticRef.current = true;
      setLoadingStatic(true);
      try {
        const [cats, top, plan] = await Promise.all([
          adminDashboardService.getCategoryStats(),
          adminDashboardService.getTopEmployers(),
          adminDashboardService.getRevenueByPlan(),
        ]);
        if (!mounted.current) return;
        setCategoryStats(cats);
        setTopEmployers(top);
        setRevenueByPlan(plan);
        loadedStaticRef.current = true;
      } catch {
        if (mounted.current) message.error("Không tải được dữ liệu bổ sung.");
      } finally {
        if (mounted.current) setLoadingStatic(false);
        fetchingStaticRef.current = false;
      }
    };
    void loadStatic();
  }, [refreshTick]);

  const handleRefresh = () => {
    loadedOverviewRef.current = false;
    loadedStaticRef.current = false;
    fetchingOverviewRef.current = false;
    fetchingStaticRef.current = false;
    fetchingTrendsRef.current = false;
    setSummary(null);
    setRevenueSummary(null);
    setSubscriptionStats(null);
    setUserStats([]);
    setPostStats([]);
    setRevenueStats([]);
    setCategoryStats([]);
    setTopEmployers([]);
    setRevenueByPlan([]);
    setRefreshTick((t) => t + 1);
  };

  const effectiveUsers = userStats.length > 0 ? userStats : lastUsersRef.current;
  const effectivePosts = postStats.length > 0 ? postStats : lastPostsRef.current;
  const effectiveRevenue = revenueStats.length > 0 ? revenueStats : lastRevenueRef.current;

  const userChartData = useMemo(() => {
    if (effectiveUsers.length === 0) return fallbackSeries(timeMode).map((d) => ({ label: d.label, employers: 0, jobSeekers: 0 }));
    return effectiveUsers.map((u) => ({
      label: (() => {
        if (timeMode === "day" && u.date) return new Date(u.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (timeMode === "month") return `${String(u.month ?? 0).padStart(2, "0")}/${u.year}`;
        return String(u.year);
      })(),
      employers: u.employers,
      jobSeekers: u.jobSeekers,
    }));
  }, [effectiveUsers, timeMode]);

  const postChartData = useMemo(() => {
    if (effectivePosts.length === 0) return fallbackSeries(timeMode).map((d) => ({ label: d.label, employerPosts: 0, jobSeekerPosts: 0 }));
    return effectivePosts.map((p) => ({
      label: (() => {
        if (timeMode === "day" && p.date)
          return new Date(p.date as unknown as string).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (timeMode === "month") return `${String(p.month ?? 0).padStart(2, "0")}/${p.year}`;
        return String(p.year);
      })(),
      employerPosts: p.employerPosts,
      jobSeekerPosts: p.jobSeekerPosts,
    }));
  }, [effectivePosts, timeMode]);

  const revenueChartData = useMemo(() => {
    if (effectiveRevenue.length === 0) return fallbackSeries(timeMode).map((d) => ({ label: d.label, revenue: 0 }));
    return effectiveRevenue.map((r) => ({
      label: (() => {
        if (timeMode === "day" && r.date)
          return new Date(r.date as unknown as string).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (timeMode === "month") return `${String(r.month ?? 0).padStart(2, "0")}/${r.year}`;
        return String(r.year);
      })(),
      revenue: r.revenue,
    }));
  }, [effectiveRevenue, timeMode]);

  const trendChartData = useMemo(() => {
    if (trendGroup === "users") {
      return userChartData.map((d) => ({
        label: d.label,
        seriesA: d.employers,
        seriesB: d.jobSeekers,
      }));
    }
    if (trendGroup === "posts") {
      return postChartData.map((d) => ({
        label: d.label,
        seriesA: d.employerPosts,
        seriesB: d.jobSeekerPosts,
      }));
    }
    return revenueChartData.map((d) => ({
      label: d.label,
      seriesA: d.revenue,
      seriesB: 0,
    }));
  }, [trendGroup, userChartData, postChartData, revenueChartData]);

  const trendYAxisDomain = useMemo(() => {
    const values = trendChartData.flatMap((d) => [d.seriesA, d.seriesB, 1]);
    return [0, Math.max(...values)];
  }, [trendChartData]);

  const subscriptionPieData = useMemo(
    () => [
      { name: "Free", value: subscriptionStats?.free ?? 0, color: "#91d5ff" },
      { name: "Medium", value: subscriptionStats?.medium ?? 0, color: "#40a9ff" },
      { name: "Premium", value: subscriptionStats?.premium ?? 0, color: "#722ed1" },
      { name: "Expired", value: subscriptionStats?.expired ?? 0, color: "#f5222d" },
    ],
    [subscriptionStats],
  );

  const periodOptions: { label: string; value: TimeMode }[] = [
    { label: "Ngày", value: "day" },
    { label: "Tháng", value: "month" },
    { label: "Năm", value: "year" },
  ];

  const renderTrendChart = () => {
    return (
      <div
        ref={trendContainerRef}
        style={{ width: "100%", minWidth: 320, height: trendSize.height, minHeight: 300 }}
        className="flex justify-center"
      >
        <LineChart
          width={trendSize.width}
          height={trendSize.height}
          data={trendChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" />
          <YAxis
            domain={[0, trendYAxisDomain[1]]}
            tickFormatter={(v: number) => (trendGroup === "revenue" ? formatCurrency(v) : formatNumber(v))}
          />
          <Tooltip
            formatter={(value?: number) =>
              trendGroup === "revenue" ? formatCurrency(value ?? 0) : formatNumber(value)
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="seriesA"
            stroke="#1677ff"
            name={
              trendGroup === "revenue"
                ? "Doanh thu"
                : trendGroup === "users"
                ? "Nhà tuyển dụng"
                : "Bài đăng nhà tuyển dụng"
            }
            dot
          />
          {trendGroup !== "revenue" && (
            <Line
              type="monotone"
              dataKey="seriesB"
              stroke="#eb2f96"
              name={trendGroup === "users" ? "Ứng viên" : "Bài đăng ứng viên"}
              dot
            />
          )}
        </LineChart>
      </div>
    );
  };

const renderBarChart = <T extends Record<string, unknown>>(data: T[], bars: { key: string; name: string; color: string }[], minHeight = 320) => {
  const labelKey = bars.length > 1 ? "planName" : "categoryName";
  const hasRevenue = bars.some((b) => b.key === "revenue");
  const hasTransactions = bars.some((b) => b.key === "transactions");
  return (
    <div ref={barContainerRef} style={{ width: "100%", minWidth: 320, height: minHeight, minHeight }} className="flex justify-center">
      <BarChart width={barSize.width} height={barSize.height} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={labelKey} />
        <YAxis tickFormatter={(v: number) => formatNumber(v)} yAxisId="left" />
        {hasRevenue && hasTransactions && <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => formatNumber(v)} />}
        <Tooltip
          formatter={(value?: number, name?: string | number) => {
            if (name === "count" || name === "transactions") return formatNumber(value);
            if (name === "revenue") return formatCurrency(value ?? 0);
            return formatNumber(value);
          }}
        />
        <Legend />
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            fill={b.color}
            radius={[4, 4, 0, 0]}
            yAxisId={hasRevenue && hasTransactions ? (b.key === "transactions" ? "right" : "left") : "left"}
          />
        ))}
      </BarChart>
    </div>
  );
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="relative z-10 space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
        <Card
          variant="borderless"
          className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl"
          styles={{ body: { padding: 24 } }}
        >
          <Space direction="vertical" size={12} className="w-full">
            <Space size={8} className="text-white/90 text-sm items-center justify-between w-full">
              <Space size={8}>
                <BarChartOutlined />
                Admin Dashboard
              </Space>
              <Button type="default" icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
            </Space>
            <Title level={3} className="!text-white !mb-1">
              Bảng điều khiển quản trị
            </Title>
            <Text className="!text-white/85">
              Theo dõi người dùng, bài đăng, doanh thu, báo cáo và gói đăng ký. Số liệu hiển thị qua biểu đồ trực quan.
            </Text>
            <Space wrap size={[8, 8]}>
              <Tag color="blue-inverse" className="rounded-full border border-white/30 text-white">
                Real-time insights
              </Tag>
              <Tag color="purple" className="rounded-full border border-white/30 text-white">
                Revenue & growth
              </Tag>
              <Tag color="magenta" className="rounded-full border border-white/30 text-white">
                User & post trends
              </Tag>
            </Space>
          </Space>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className={`${panelClass} min-w-0`}>
          <Statistic
            title="Tổng người dùng"
            value={summary?.totalUsers ?? 0}
            formatter={(val) => formatNumber(Number(val))}
            valueStyle={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}
            prefix={<TeamOutlined className="text-blue-500" />}
          />
          <Text type="secondary">Mới 30 ngày: {formatNumber(summary?.newUsers30Days ?? 0)}</Text>
        </Card>
        <Card className={`${panelClass} min-w-0`}>
          <Statistic
            title="Bài đăng"
            value={summary?.totalPosts ?? 0}
            formatter={(val) => formatNumber(Number(val))}
            valueStyle={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}
            prefix={<FileTextOutlined className="text-purple-500" />}
          />
          <Text type="secondary">
            Active {formatNumber(summary?.activePosts ?? 0)} | Pending {formatNumber(summary?.pendingPosts ?? 0)}
          </Text>
        </Card>
        <Card className={`${panelClass} min-w-0`}>
          <Statistic
            title="Báo cáo chờ xử lý"
            value={summary?.pendingReports ?? 0}
            formatter={(val) => formatNumber(Number(val))}
            valueStyle={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}
            prefix={<FlagOutlined className="text-red-500" />}
          />
          <Text type="secondary">Đã xử lý: {formatNumber(summary?.solvedReports ?? 0)}</Text>
        </Card>
        <Card className={`${panelClass} min-w-0`}>
          <Statistic
            title="Ứng tuyển"
            value={summary?.totalApplications ?? 0}
            formatter={(val) => formatNumber(Number(val))}
            valueStyle={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}
            prefix={<UserAddOutlined className="text-emerald-500" />}
          />
          <Text type="secondary">Mới 30 ngày: {formatNumber(summary?.newApplications30Days ?? 0)}</Text>
        </Card>
      </div>

      <Card
        className={`${panelClass} min-w-0`}
        styles={{ body: { minHeight: 380 } }}
        title={
          <>
            <Space className="flex items-center justify-between w-full">
              <Space>
                <LineChartOutlined className="text-blue-500" />
                <span>Biểu đồ tổng hợp</span>
              </Space>
              <Space>
                <Segmented size="small" options={periodOptions} value={timeMode} onChange={(v) => setTimeMode(v as TimeMode)} />
                <Segmented
                  size="small"
                  options={[
                    { label: "Người dùng", value: "users" },
                    { label: "Bài đăng", value: "posts" },
                    { label: "Doanh thu", value: "revenue" },
                  ]}
                  value={trendGroup}
                  onChange={(v) => setTrendGroup(v as TrendGroup)}
                />
              </Space>
            </Space>
          </>
        }
      >
        {renderTrendChart()}
        {trendGroup === "revenue" && (
          <>
            <Divider />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Statistic
                title="Tổng doanh thu"
                value={revenueSummary?.totalRevenue ?? 0}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontWeight: 600 }}
                prefix={<DollarOutlined className="text-blue-500" />}
              />
              <Statistic
                title="Tháng này"
                value={revenueSummary?.thisMonthRevenue ?? 0}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontWeight: 600 }}
                prefix={<LineChartOutlined className="text-emerald-500" />}
              />
              <Statistic
                title="Tăng trưởng"
                value={revenueSummary?.growthPercent ?? 0}
                suffix="%"
                valueStyle={{ color: (revenueSummary?.growthPercent ?? 0) >= 0 ? "#389e0d" : "#cf1322", fontWeight: 600 }}
                prefix={<RiseOutlined className={(revenueSummary?.growthPercent ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"} />}
              />
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={`${panelClass} min-w-0`} title="Doanh thu theo gói">
          {renderBarChart(revenueByPlan, [
            { key: "revenue", name: "Doanh thu", color: "#1677ff" },
            { key: "transactions", name: "Số giao dịch", color: "#52c41a" },
          ])}
        </Card>

        <Card className={`${panelClass} min-w-0`} title="Phân bổ danh mục bài đăng">
          {renderBarChart(categoryStats, [{ key: "count", name: "Bài đăng", color: "#722ed1" }])}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={`${panelClass} min-w-0`} title="Tình trạng gói đăng ký">
          <>
            <div style={{ width: "100%", minWidth: 260, height: 260, minHeight: 240 }} className="flex items-center justify-center">
              <PieChart width={260} height={260}>
                <Pie data={subscriptionPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                  {subscriptionPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value?: number) => formatNumber(value)} />
              </PieChart>
            </div>
            <Divider />
            <Space direction="vertical" size={6} className="w-full">
              <Text type="secondary">Đang hoạt động: {formatNumber(subscriptionStats?.active ?? 0)}</Text>
              <Progress
                percent={
                  (subscriptionStats?.active ?? 0) + (subscriptionStats?.expired ?? 0) > 0
                    ? Math.round(
                        ((subscriptionStats?.active ?? 0) / ((subscriptionStats?.active ?? 0) + (subscriptionStats?.expired ?? 0))) * 100,
                      )
                    : 0
                }
                status="active"
                showInfo={false}
              />
              <Text type="secondary">Hết hạn: {formatNumber(subscriptionStats?.expired ?? 0)}</Text>
            </Space>
          </>
        </Card>

        <Card className={`${panelClass} min-w-0`} title="Top nhà tuyển dụng">
          <List
            itemLayout="horizontal"
            dataSource={topEmployers}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700 border border-slate-200">
                      {index + 1}
                    </div>
                  }
                  title={
                    <Space>
                      <TrophyOutlined className="text-amber-500" />
                      <span>{item.employerName}</span>
                    </Space>
                  }
                  description={
                    <Space size={12}>
                      <Tag color="blue">Bài đăng: {formatNumber(item.totalPosts)}</Tag>
                      <Tag color="green">Ứng tuyển: {formatNumber(item.totalApplications)}</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
