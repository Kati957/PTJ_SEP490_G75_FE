import React, { useEffect, useState } from "react";
import { Empty, Spin, Tag, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { Employer as ListingEmployer, EmployerRanking } from "../../listEmployer-jobSeeker/types";
import { getTopEmployersByApply } from "../../listEmployer-jobSeeker/services/service";
import bannerImageUrl from "../../../assets/employer-banner.png";
import defaultLogo from "../../../assets/no-logo.png";
import { useAuth } from "../../auth/hooks";
import { ROLES } from "../../../constants/roles";
import followService from "../../follow/followService";

type RankedEmployerView = ListingEmployer & { applyCount?: number };

const mapRankingToEmployer = (ranking: EmployerRanking): RankedEmployerView => ({
  id: ranking.employerId,
  name: ranking.companyName,
  logo: ranking.logoUrl || "",
  jobCount: ranking.activePostCount,
  locations: [], // API không trả địa điểm
  applyCount: ranking.totalApplyCount,
});

const TopEmployersSlider: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<RankedEmployerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const isJobSeeker = !!user && user.roles.includes(ROLES.JOB_SEEKER);

  useEffect(() => {
    let mounted = true;
    const fetchTop = async () => {
      setLoading(true);
      try {
        const ranking = await getTopEmployersByApply(10);
        if (!mounted) return;
        setEmployers(ranking.map(mapRankingToEmployer));
      } catch {
        if (mounted) setEmployers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchTop();
    const fetchFollowed = async () => {
      if (!isJobSeeker || !user?.id) return;
      try {
        const data = await followService.getFollowedEmployers(user.id);
        const setIds = new Set<number>();
        data?.forEach((item: any) => {
          const id = item.employerId ?? item.EmployerID ?? item.employerID ?? item.id;
          if (id) setIds.add(Number(id));
        });
        setFollowedIds(setIds);
      } catch {
        // ignore quietly
      }
    };
    void fetchFollowed();
    return () => {
      mounted = false;
    };
  }, [isJobSeeker, user?.id]);

  const toggleFollow = async (employerId: number) => {
    if (!isJobSeeker || !user?.id) {
      message.info("Vui lòng đăng nhập bằng tài khoản ứng viên để theo dõi.");
      return;
    }
    setActionLoadingId(employerId);
    const isFollowing = followedIds.has(employerId);
    try {
      if (isFollowing) {
        await followService.unfollow(employerId, user.id);
        const next = new Set(followedIds);
        next.delete(employerId);
        setFollowedIds(next);
        message.success("Đã hủy theo dõi.");
      } else {
        await followService.follow(employerId, user.id);
        const next = new Set(followedIds);
        next.add(employerId);
        setFollowedIds(next);
        message.success("Đã theo dõi nhà tuyển dụng.");
      }
    } catch {
      message.error("Thao tác theo dõi thất bại, thử lại sau.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const highlight = employers[0];
  const others = employers.slice(1);
  const hasOddOthers = others.length % 2 === 1;
  const regularOthers = hasOddOthers ? others.slice(0, -1) : others;
  const trailingEmployer = hasOddOthers ? others[others.length - 1] : undefined;

  const renderEmployerCard = (employer: RankedEmployerView, rank: number) => {
    const isFollowing = followedIds.has(employer.id);
    return (
      <div
        key={employer.id}
        className="flex h-full flex-col rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-[1px] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex h-full flex-col rounded-2xl bg-white/90 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 p-2 ring-1 ring-amber-100">
              <img src={employer.logo || defaultLogo} alt={employer.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase text-amber-500">Top {rank}</p>
              <p className="truncate text-base font-semibold text-slate-900">{employer.name}</p>
              <p className="text-sm text-slate-500">
                {employer.jobCount} việc đang tuyển
                {typeof employer.applyCount !== "undefined" && ` · ${employer.applyCount} lượt ứng tuyển`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="small"
              type="default"
              className="h-9 rounded-xl border-amber-200 bg-white text-amber-700 font-semibold hover:border-amber-300"
              loading={actionLoadingId === employer.id}
              onClick={() => toggleFollow(employer.id)}
            >
              {isFollowing ? "Đang theo dõi" : "+ Theo dõi"}
            </Button>
            <Link to={`/nha-tuyen-dung/chi-tiet/${employer.id}`} className="ml-auto">
              <Tag color="gold" className="m-0 rounded-full px-3 py-1">
                Xem chi tiết
              </Tag>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="px-0 py-5 md:py-7 flex justify-center">
      <div
        className="w-full overflow-hidden rounded-[2.5rem] shadow-[0_30px_90px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
        style={{ width: "min(1400px, calc(100vw - 64px))" }}
      >
        <div
          className="relative min-h-[140px] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(245,158,11,0.95), rgba(217,119,6,0.9)), url('${bannerImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-3 px-6 py-6 sm:px-10 sm:py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold drop-shadow-sm">Nhà tuyển dụng tiêu biểu</p>
              <p className="text-sm text-amber-100 drop-shadow-sm">
                Hàng trăm nhà tuyển dụng uy tín đang tuyển dụng • Cập nhật liên tục
              </p>
            </div>
        
          </div>
        </div>

        <div className="bg-white p-5 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Đối tác</p>
              <h2 className="text-3xl font-bold text-slate-900">Nhà tuyển dụng nổi bật</h2>
              <p className="text-sm text-slate-500">
                Top nhà tuyển dụng có nhiều lượt ứng tuyển nhất, cập nhật theo thời gian thực.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/employer")}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-800"
              >
                Xem tất cả &rarr;
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : employers.length === 0 ? (
            <Empty description="Chưa có nhà tuyển dụng nào" />
          ) : (
            <div
              className="grid gap-6 lg:grid-cols-3"
              style={{ gridTemplateRows: "repeat(4, minmax(150px, 1fr))" }}
            >
              {highlight && (
                <div
                  className="row-span-3 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-slate-900 p-6 text-white shadow-xl md:p-7 lg:row-span-3 lg:row-start-1"
                  style={{ gridRowStart: 1, gridRowEnd: 4 }}
                >
                  <div className="flex h-full flex-col items-center text-center">
              <Tag color="gold" className="mb-3 rounded-full px-4 py-1.5 text-sm font-semibold">
                Top 1
              </Tag>

                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-3 ring-2 ring-white/20 md:h-28 md:w-28 md:p-4">
                      <img
                        src={highlight.logo || defaultLogo}
                        alt={highlight.name}
                        className="h-full w-full rounded-2xl bg-white object-contain"
                      />
                    </div>

                    <h3 className="text-xl font-bold leading-tight md:text-2xl">{highlight.name}</h3>
                    <p className="text-amber-100">{highlight.locations[0] || "Ngành/địa điểm đang cập nhật"}</p>

                    <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                      <span className="rounded-full bg-white/20 px-2 py-1 text-xs text-amber-100">Việc làm</span>
                      <span className="text-white">{highlight.jobCount} việc đang tuyển</span>
                    </div>

                    <div className="mt-auto flex w-full flex-col gap-3 pt-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button
                          className="h-11 rounded-xl bg-white text-amber-700 shadow-sm hover:brightness-105 sm:w-40"
                          loading={actionLoadingId === highlight.id}
                          onClick={() => toggleFollow(highlight.id)}
                        >
                          {followedIds.has(highlight.id) ? "Đang theo dõi" : "+ Theo dõi"}
                        </Button>
                        <Link
                          to={`/nha-tuyen-dung/chi-tiet/${highlight.id}`}
                          className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-100 px-4 font-semibold text-amber-800 shadow-sm transition hover:brightness-105 sm:w-40"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                      <Link
                        to="/employer"
                        className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 font-semibold text-white hover:bg-white/10"
                      >
                        Xem tất cả nhà tuyển dụng
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {regularOthers.map((employer, idx) => {
                const columnStart = idx % 2 === 0 ? 2 : 3;
                const rowStart = Math.floor(idx / 2) + 1;
                return (
                  <div
                    key={employer.id}
                    className="lg:h-full"
                    style={{ gridColumnStart: columnStart, gridRowStart: rowStart }}
                  >
                    {renderEmployerCard(employer, idx + 2)}
                  </div>
                );
              })}

              {trailingEmployer && (
                <div
                  className="lg:col-start-1 lg:row-start-4 lg:row-span-1"
                  style={{ gridRowStart: 4, gridRowEnd: 5 }}
                >
                  {renderEmployerCard(trailingEmployer, regularOthers.length + 2)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopEmployersSlider;
