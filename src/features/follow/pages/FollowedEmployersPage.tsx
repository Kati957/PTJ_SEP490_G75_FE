import React, { useEffect, useState } from "react";
import { Card, List, Spin, message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import followService, { type EmployerFollowDto } from "../followService";
import defaultLogo from "../../../assets/no-logo.png";
import { getEmployerPublicProfile } from "../../listEmployer-jobSeeker/services/service";

const FollowedEmployersPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [items, setItems] = useState<EmployerFollowDto[]>([]);
  const [loading, setLoading] = useState(false);

  const toNumber = (value: unknown): number | undefined => {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const toStringSafe = (value: unknown, fallback = ""): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await followService.getFollowedEmployers(userId);
        const rawList: Record<string, unknown>[] = Array.isArray(data)
          ? (data as unknown as Record<string, unknown>[])
          : [];
        const mappedItems: EmployerFollowDto[] = rawList.map((item) => {
          const employerId =
            toNumber(item.employerId) ??
            toNumber((item as Record<string, unknown>).EmployerID) ??
            toNumber((item as Record<string, unknown>).employerID) ??
            toNumber(item.id) ??
            0;

          return {
            employerId,
            employerName:
              toStringSafe(item.employerName) ||
              toStringSafe((item as Record<string, unknown>).EmployerName, "Nhà tuyển dụng"),
            followDate:
              toStringSafe(item.followDate) ||
              toStringSafe((item as Record<string, unknown>).FollowDate) ||
              toStringSafe((item as Record<string, unknown>).followedAt) ||
              toStringSafe((item as Record<string, unknown>).followedDate),
            logoUrl:
              toStringSafe(item.logoUrl) ||
              toStringSafe((item as Record<string, unknown>).logo) ||
              toStringSafe((item as Record<string, unknown>).employerLogoUrl) ||
              toStringSafe((item as Record<string, unknown>).avatarUrl) ||
              toStringSafe((item as Record<string, unknown>).logoUrlSmall) ||
              toStringSafe((item as Record<string, unknown>).logo_path, ""),
          };
        });

        const enrichedItems = await Promise.all(
          mappedItems.map(async (item) => {
            if (item.logoUrl || !item.employerId) {
              return item;
            }
            try {
              const profile = await getEmployerPublicProfile(item.employerId);
              return {
                ...item,
                employerName: profile.displayName || item.employerName,
                logoUrl: profile.avatarUrl || item.logoUrl || "",
              };
            } catch (error) {
              console.warn("Không thể tải profile nhà tuyển dụng", item.employerId, error);
              return item;
            }
          })
        );
        setItems(enrichedItems);
      } catch {
        message.error("Không thể tải danh sách theo dõi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        Vui lòng đăng nhập để xem danh sách nhà tuyển dụng theo dõi.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Danh sách theo dõi</h1>
          <p className="text-sm text-slate-600">
            Danh sách các nhà tuyển dụng bạn đang theo dõi để nhận thông tin tuyển dụng mới.
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            Tổng: <span className="text-slate-900 font-bold">{items.length}</span>
          </span>
        </div>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <Spin spinning={loading}>
          {items.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              Bạn chưa theo dõi nhà tuyển dụng nào.
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() =>
                    item.employerId &&
                    navigate(`/nha-tuyen-dung/chi-tiet/${item.employerId}`)
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <img
                        src={item.logoUrl || defaultLogo}
                        alt={item.employerName}
                        className="h-12 w-12 rounded-full object-cover border border-slate-100 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = defaultLogo;
                        }}
                      />
                    }
                    title={
                      <span className="font-semibold text-gray-900">{item.employerName}</span>
                    }
                    description={
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarOutlined />
                        <span>
                          Theo dõi từ:{" "}
                          {item.followDate
                            ? new Date(item.followDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </div>
                    }
                  />
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
                    Nhà tuyển dụng
                  </span>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default FollowedEmployersPage;
