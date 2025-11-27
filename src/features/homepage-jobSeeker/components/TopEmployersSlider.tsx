import React, { useEffect, useState } from "react";
import { Empty, Spin, Tag, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { Employer as ListingEmployer, EmployerRanking } from "../../listEmployer-jobSeeker/types";
import { getTopEmployersByApply } from "../../listEmployer-jobSeeker/services/service";

type RankedEmployerView = ListingEmployer & { applyCount?: number };

const bannerImageUrl = "/src/assets/top-employer-banner.png"; // Thay bằng ảnh banner thực tế của bạn

const mapRankingToEmployer = (ranking: EmployerRanking): RankedEmployerView => ({
  id: ranking.employerId,
  name: ranking.companyName,
  logo: ranking.logoUrl || "",
  jobCount: ranking.activePostCount,
  locations: [], // API không trả địa điểm
  applyCount: ranking.totalApplyCount,
});

const TopEmployersSlider: React.FC = () => {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<RankedEmployerView[]>([]);
  const [loading, setLoading] = useState(false);

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
    return () => {
      mounted = false;
    };
  }, []);

  const highlight = employers[0];
  const others = employers.slice(1);

  return (
    <section className="px-4">
      <div className="mx-auto max-w-[120rem] overflow-hidden rounded-3xl shadow-[0_30px_90px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
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
              <p className="text-lg font-semibold drop-shadow-sm">Thương hiệu lớn tiêu biểu</p>
              <p className="text-sm text-amber-100 drop-shadow-sm">
                Hàng trăm thương hiệu uy tín đang tuyển dụng • Cập nhật liên tục
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              className="!bg-amber-100 !text-amber-700 !font-semibold !border-none hover:!bg-white"
              onClick={() => navigate("/employer")}
            >
              Pro Company
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Đối tác</p>
              <h2 className="text-3xl font-bold text-slate-900">Nhà tuyển dụng nổi bật</h2>
              <p className="text-sm text-slate-500">
                Top doanh nghiệp có nhiều lượt ứng tuyển nhất, cập nhật theo thời gian thực.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/employer")} type="default">
                Xem tất cả
              </Button>
              <Button type="primary" onClick={() => navigate("/nha-tuyen-dung/register")}>
                Trở thành nhà tuyển dụng
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : employers.length === 0 ? (
            <Empty description="Chưa có nhà tuyển dụng nào" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {highlight && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-slate-900 p-6 text-white shadow-xl">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Tag color="gold" className="m-0 rounded-full px-3 py-1 font-semibold">
                        Top 1
                      </Tag>
                      <span className="text-sm text-amber-100">Lượt ứng tuyển cao nhất</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl bg-white/10 p-3 ring-2 ring-white/20">
                        <img
                          src={highlight.logo || "/src/assets/no-logo.png"}
                          alt={highlight.name}
                          className="h-full w-full rounded-xl bg-white object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold leading-tight">{highlight.name}</h3>
                        <p className="text-amber-100">{highlight.locations[0] || "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-amber-100">Việc đang mở</p>
                        <p className="text-2xl font-bold">{highlight.jobCount}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-amber-100">Lượt ứng tuyển</p>
                        <p className="text-2xl font-bold">
                          {typeof highlight.applyCount !== "undefined" ? highlight.applyCount : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <Link
                        to={`/nha-tuyen-dung/chi-tiet/${highlight.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 font-semibold text-amber-700 hover:brightness-105"
                      >
                        Xem chi tiết
                      </Link>
                      <Link
                        to="/employer"
                        className="inline-flex items-center justify-center rounded-xl border border-white/40 px-4 py-2 font-semibold text-white hover:bg-white/10"
                      >
                        Xem tất cả nhà tuyển dụng
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  {others.map((employer, idx) => (
                    <Link
                      key={employer.id}
                      to={`/nha-tuyen-dung/chi-tiet/${employer.id}`}
                      className="block h-full"
                    >
                      <div className="flex h-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 p-2">
                          <img
                            src={employer.logo || "/src/assets/no-logo.png"}
                            alt={employer.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase text-slate-400">Top {idx + 2}</p>
                          <p className="truncate text-base font-semibold text-slate-900">{employer.name}</p>
                          <p className="text-sm text-slate-500">
                            {employer.jobCount} việc đang tuyển
                            {typeof employer.applyCount !== "undefined" && ` · ${employer.applyCount} lượt ứng tuyển`}
                          </p>
                        </div>
                        <Tag color="blue" className="m-0 rounded-full px-3 py-1">
                          Xem chi tiết
                        </Tag>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopEmployersSlider;
