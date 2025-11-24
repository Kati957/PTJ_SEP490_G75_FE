import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, List, Empty, message, Tag, Spin, Badge } from "antd";
import { HeartFilled, ReloadOutlined, TeamOutlined, CheckCircleTwoTone, CompassOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useAuth } from "../../auth/hooks";
import { Link, useNavigate } from "react-router-dom";
import followService from "../services/followService";

type EmployerFollowItem = {
  employerID: number;
  employerName: string;
  followDate: string;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

const FollowedEmployersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jobSeekerId = user?.id;

  const [items, setItems] = useState<EmployerFollowItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!jobSeekerId) return;
    setLoading(true);
    try {
      const res = await followService.list(jobSeekerId);
      setItems(res ?? []);
    } catch (err) {
      console.error("Failed to load followed employers", err);
      message.error("Không thể tải danh sách theo dõi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [jobSeekerId]);

  const handleUnfollow = async (employerId: number) => {
    if (!jobSeekerId) return;
    try {
      await followService.unfollow(jobSeekerId, employerId);
      message.success("Đã hủy theo dõi nhà tuyển dụng.");
      setItems((prev) => prev.filter((i) => i.employerID !== employerId));
    } catch (err) {
      console.error("Failed to unfollow", err);
      message.error("Không thể hủy theo dõi. Thử lại sau.");
    }
  };

  const totalFollow = items.length;
  const followSince = useMemo(() => (items[0]?.followDate ? formatDate(items[0].followDate) : null), [items]);

  if (!jobSeekerId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <p className="text-center text-gray-600">Vui lòng đăng nhập để xem danh sách nhà tuyển dụng đang theo dõi.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 space-y-6">
            <Card
              bordered={false}
              className="shadow-md bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white"
              bodyStyle={{ padding: 20 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="uppercase text-xs tracking-[0.2em] text-white/80 mb-1">Theo dõi nhà tuyển dụng</p>
                  <h1 className="text-2xl font-bold leading-tight">Nhà tuyển dụng bạn đang theo dõi</h1>
                  <p className="text-white/85 mt-1">
                    Giữ kết nối để không bỏ lỡ cơ hội phù hợp nhất.
                  </p>
                </div>
                <div className="flex items-center gap-3 relative">
                  <span className="absolute -left-1 -top-1 w-4 h-4 rounded-full bg-white/70 blur-sm animate-ping" aria-hidden />
                  <Badge count={totalFollow} overflowCount={99} showZero>
                    <HeartFilled className="text-white text-3xl drop-shadow animate-pulse" />
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-white/80">Đang theo dõi</p>
                    <p className="text-lg font-semibold">{totalFollow} nhà tuyển dụng</p>
                    {followSince && <p className="text-xs text-white/70">Từ {followSince}</p>}
                  </div>
                </div>
              </div>
            </Card>

            <Card
              bordered={false}
              className="shadow-sm"
              title={
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-blue-600" />
                  <span>Danh sách theo dõi</span>
                </div>
              }
              extra={
                <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                  Tải lại
                </Button>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 space-y-3">
                  <HeartFilled className="text-pink-500 text-3xl" />
                  <h3 className="text-lg font-semibold text-slate-800">Chưa có nhà tuyển dụng nào</h3>
                  <p className="text-sm text-slate-600">
                    Theo dõi các nhà tuyển dụng để nhận thông báo việc làm mới nhất.
                  </p>
                  <div className="flex gap-3">
                    <Link to="/employer">
                      <Button type="primary">Xem danh sách nhà tuyển dụng</Button>
                    </Link>
                    <Link to="/viec-lam">
                      <Button>Khám phá việc làm</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={items}
                  renderItem={(item) => (
                    <List.Item
                      key={item.employerID}
                      className="border border-slate-100 rounded-2xl mb-3 p-4 hover:border-blue-200 hover:shadow-sm transition"
                      actions={[
                        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(`/nha-tuyen-dung/chi-tiet/${item.employerID}`)}>
                          Xem chi tiết
                        </Button>,
                        <Button type="link" danger onClick={() => handleUnfollow(item.employerID)}>
                          Hủy theo dõi
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {item.employerName.charAt(0).toUpperCase()}
                          </div>
                        }
                        title={<span className="font-semibold text-slate-900">{item.employerName}</span>}
                        description={
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircleTwoTone twoToneColor="#52c41a" />
                            <span>Theo dõi từ {formatDate(item.followDate)}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </div>

          <div className="lg:w-1/3 space-y-4">
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CompassOutlined />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gợi ý</p>
                  <p className="font-semibold text-slate-800">Khám phá thêm cơ hội</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>• Cập nhật hồ sơ để NTD dễ tìm thấy bạn hơn.</p>
                <p>• Theo dõi các công ty yêu thích để nhận thông báo việc làm mới.</p>
                <p>• Ứng tuyển sớm để tăng khả năng được phản hồi.</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to="/viec-lam">
                  <Button type="primary">Tìm việc ngay</Button>
                </Link>
                <Link to="/employer">
                  <Button>Danh sách NTD</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowedEmployersPage;
