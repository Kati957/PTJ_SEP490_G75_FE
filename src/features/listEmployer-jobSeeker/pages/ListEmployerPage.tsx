import React, { useMemo } from "react";
import { Row, Col, Input, Spin, Pagination, Empty, Tag, Statistic } from "antd";
import { Link } from "react-router-dom";
import { useEmployers } from "../hooks/useEmployers";
import EmployerCard from "../components/EmployerCard";

const { Search } = Input;

const ListEmployerPage: React.FC = () => {
  const { employers, loading, applyFilters, totalRecords, currentPage, pageSize } = useEmployers();

  const totalOpenJobs = useMemo(
    () => employers.reduce((sum, employer) => sum + (employer.jobCount || 0), 0),
    [employers]
  );

  const totalLocations = useMemo(() => {
    const locationSet = new Set<string>();
    employers.forEach((employer) => {
      employer.locations?.forEach((loc) => locationSet.add(loc));
    });
    return locationSet.size;
  }, [employers]);

  const handleSearch = (keyword: string) => {
    applyFilters({ keyword, page: 1 });
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    applyFilters({
      page,
      pageSize: newPageSize || pageSize,
    });
  };

  const heroBackground =
    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 30%), linear-gradient(120deg, #059669 0%, #0ea5e9 45%, #0f172a 100%)";

  return (
    <div className="min-h-screen bg-slate-50">
      <section
        className="relative overflow-hidden pb-24 pt-14 text-white"
        style={{ backgroundImage: heroBackground }}
      >
        <div className="absolute inset-0 opacity-80" />
        <div className="absolute -left-12 top-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-5 md:items-end">
            <div className="md:col-span-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
                Nhà tuyển dụng
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                Khám phá công ty phù hợp
              </h1>
              <p className="mt-3 max-w-3xl text-lg text-emerald-50">
                Tìm kiếm nhanh các nhà tuyển dụng uy tín, xem logo, vị trí và số lượng việc đang mở tuyển.
                Cập nhật liên tục từ cộng đồng doanh nghiệp trong hệ thống.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Tag color="gold" className="m-0 flex items-center justify-between rounded-full px-4 py-2 text-base">
                  <span>Tổng NTD</span>
                  <span className="font-bold">{totalRecords}</span>
                </Tag>
                <Tag color="blue" className="m-0 flex items-center justify-between rounded-full px-4 py-2 text-base">
                  <span>Việc đang tuyển</span>
                  <span className="font-bold">{totalOpenJobs}</span>
                </Tag>
                <Tag color="green" className="m-0 flex items-center justify-between rounded-full px-4 py-2 text-base">
                  <span>Điểm đến</span>
                  <span className="font-bold">{totalLocations}</span>
                </Tag>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur ring-1 ring-white/15">
                <h3 className="text-xl font-semibold">Tìm nhanh nhà tuyển dụng</h3>
                <p className="mt-1 text-sm text-emerald-50">
                  Nhập tên, ngành hoặc địa điểm để lọc danh sách phù hợp.
                </p>
                <div className="mt-4">
                  <Search
                    placeholder="Nhập tên nhà tuyển dụng..."
                    onSearch={handleSearch}
                    enterButton="Tìm kiếm"
                    size="large"
                    defaultValue=""
                    loading={loading}
                    className="shadow-lg"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-center text-sm text-emerald-50">
                  <Statistic
                    title="Trang hiện tại"
                    value={currentPage}
                    valueStyle={{ color: "white", fontWeight: 700 }}
                  />
                  <Statistic
                    title="Kích thước trang"
                    value={pageSize}
                    valueStyle={{ color: "white", fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 -mt-16 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Spin size="large" />
              </div>
            ) : employers.length > 0 ? (
              <>
                <Row gutter={[20, 20]}>
                  {employers.map((employer) => (
                    <Col key={employer.id} xs={24} sm={12} md={8} lg={6}>
                      <Link to={`/nha-tuyen-dung/chi-tiet/${employer.id}`} className="block h-full">
                        <EmployerCard employer={employer} />
                      </Link>
                    </Col>
                  ))}
                </Row>

                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalRecords}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 py-12 text-center shadow-sm">
                <Empty description="Không tìm thấy nhà tuyển dụng nào phù hợp." />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListEmployerPage;
