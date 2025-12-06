import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Spin, message } from "antd";
import { LeftOutlined, RightOutlined, StarFilled, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import baseService from "../../../services/baseService";
import { getEmployerPublicProfile } from "../../listEmployer-jobSeeker/services/service";
import followService from "../../follow/followService";
import { useAuth } from "../../auth/hooks";
import { ROLES } from "../../../constants/roles";
import defaultLogo from "../../../assets/no-logo.png";

type ActiveSubscription = {
  subscriptionId?: number;
  userId?: number;
  userEmail?: string;
  planId?: number;
  planName?: string;
  userName?: string;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  employerLogoUrl?: string | null;
};

const pickLogo = (raw: ActiveSubscription): string | undefined => {
  const candidates = [
    raw.avatarUrl,
    raw.logoUrl,
    raw.employerLogoUrl,
    (raw as Record<string, unknown>).logo,
    (raw as Record<string, unknown>).avatar,
  ];
  const found = candidates.find((value) => typeof value === "string" && value.trim());
  return found ? (found as string) : undefined;
};

const PremiumEmployersCarousel: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActiveSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isJobSeeker = !!user && user.roles?.includes(ROLES.JOB_SEEKER);

  useEffect(() => {
    let mounted = true;
    const fetchPremium = async () => {
      setLoading(true);
      try {
        const res = await baseService.get<{ success?: boolean; data?: ActiveSubscription[] } | ActiveSubscription[]>(
          "/payment/public/active-subscriptions"
        );
        if (!mounted) return;
        const data = (res as { data?: ActiveSubscription[] })?.data ?? res ?? [];
        const list: ActiveSubscription[] = Array.isArray(data) ? data : [];
        const enriched = await Promise.all(
          list.map(async (item) => {
            const baseLogo = pickLogo(item);
            if (!item.userId || baseLogo) {
              return { ...item, avatarUrl: baseLogo };
            }
            try {
              const profile = await getEmployerPublicProfile(item.userId);
              return {
                ...item,
                userName: profile.displayName || item.userName,
                avatarUrl: profile.avatarUrl || baseLogo,
              };
            } catch (error) {
              console.warn("Khong the tai avatar nha tuyen dung Premium", item.userId, error);
              return { ...item, avatarUrl: baseLogo };
            }
          })
        );
        if (!mounted) return;
        setItems(enriched);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchPremium();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isJobSeeker || !user?.id) {
      setFollowedIds(new Set());
      return;
    }
    let mounted = true;
    const fetchFollowed = async () => {
      try {
        const data = await followService.getFollowedEmployers(user.id);
        if (!mounted) return;
        const ids = new Set<number>();
        (data ?? []).forEach((item: { employerId?: number }) => {
          if (item?.employerId) ids.add(Number(item.employerId));
        });
        setFollowedIds(ids);
      } catch {
        if (mounted) setFollowedIds(new Set());
      }
    };
    void fetchFollowed();
    return () => {
      mounted = false;
    };
  }, [isJobSeeker, user?.id]);

  const handleFollowToggle = React.useCallback(
    async (employerId?: number, isFollowed?: boolean) => {
      if (!employerId) return;
      if (!isJobSeeker || !user?.id) {
        message.info("Vui long dang nhap tai khoan ung vien de theo doi.");
        return;
      }
    setActionLoadingId(employerId);
    try {
      if (isFollowed) {
        await followService.unfollow(employerId, user.id);
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(employerId);
          return next;
        });
        message.success("Da huy theo doi.");
      } else {
        await followService.follow(employerId, user.id);
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.add(employerId);
          return next;
        });
        message.success("Da theo doi nha tuyen dung.");
      }
    } catch {
      message.error("Thao tac theo doi/huy theo doi that bai, vui long thu lai.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [isJobSeeker, user?.id]
  );

  const cards = useMemo(
    () =>
      items.map((item, idx) => {
        const company = item.userName || item.userEmail?.split("@")[0] || "Nhà tuyển dụng";
        const email = item.userEmail || "Ẩn email";
        const viewLink = item.userId ? `/nha-tuyen-dung/chi-tiet/${item.userId}` : "#";
        const logoSrc = pickLogo(item) || defaultLogo;
        const employerId = item.userId;
        const isFollowed = employerId ? followedIds.has(employerId) : false;

        return (
          <div
            key={`${item.subscriptionId ?? item.userId ?? idx}`}
            className="relative flex-shrink-0 w-80 sm:w-96 md:w-[26rem] snap-start"
          >
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-4 shadow-sm hover:-translate-y-1 transition">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-white ring-1 ring-amber-100 flex items-center justify-center">
                  <img
                    src={logoSrc}
                    alt={company}
                    className="h-14 w-14 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = defaultLogo;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={viewLink} className="block text-base font-bold text-amber-700 hover:text-amber-800 truncate">
                    {company}
                  </Link>
                  <p className="text-sm text-slate-500 truncate">{email}</p>
                  <p className="text-xs uppercase text-amber-500 font-semibold flex items-center gap-1 mt-1">
                    <StarFilled /> Premium
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to={viewLink} className="text-sm text-slate-600 flex items-center gap-2 hover:text-slate-800">
                  <span role="img" aria-label="briefcase">
                    💼
                  </span>
                  <span>Xem chi tiết</span>
                </Link>
                <Button
                  type="default"
                  size="small"
                  className="rounded-full px-3 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                  icon={<PlusOutlined />}
                  onClick={() => handleFollowToggle(employerId, isFollowed)}
                  loading={actionLoadingId === employerId}
                  disabled={!employerId}
                >
                  {isFollowed ? "Hủy theo dõi" : "Theo dõi"}
                </Button>
              </div>
            </div>
          </div>
        );
      }),
    [items, followedIds, actionLoadingId, handleFollowToggle]
  );

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const width = container.clientWidth;
    container.scrollBy({ left: dir === "left" ? -width * 0.9 : width * 0.9, behavior: "smooth" });
  };

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">Premium</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Nhà tuyển dụng đang dùng gói Premium</h2>
          <p className="text-sm text-slate-500">Danh sách tự động từ gói nâng cấp PayOS.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button shape="circle" icon={<LeftOutlined />} onClick={() => scroll("left")} />
          <Button shape="circle" icon={<RightOutlined />} onClick={() => scroll("right")} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : cards.length === 0 ? (
        <Empty description="Chưa có nhà tuyển dụng Premium" />
      ) : (
        <div className="relative">
          <div className="md:hidden absolute -left-3 top-1/2 -translate-y-1/2 z-10">
            <Button shape="circle" icon={<LeftOutlined />} onClick={() => scroll("left")} />
          </div>
          <div className="md:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <Button shape="circle" icon={<RightOutlined />} onClick={() => scroll("right")} />
          </div>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {cards}
          </div>
        </div>
      )}
    </section>
  );
};

export default PremiumEmployersCarousel;
