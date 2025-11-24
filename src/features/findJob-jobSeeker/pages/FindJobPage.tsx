import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchFindJobData } from "../slice";
import type { AppDispatch } from "../../../app/store";
import { SearchBar } from "../components/SearchBar";
import JobListSection from "../components/JobListSection";
import FilterSidebar from "../components/FilterSidebar";
import type { JobSearchFilters } from "../types";
import { Carousel } from "antd";
import heroBg from "../../../assets/anhhome.png";
import heroSlide from "../../../assets/anhlidehomepage.png";

const DEFAULT_FILTERS: JobSearchFilters = {
  keyword: "",
  provinceId: null,
  categoryId: null,
  subCategoryId: null,
  salary: "all",
};

const FindJobPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_FILTERS);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "salaryDesc" | "salaryAsc"
  >("newest");

  useEffect(() => {
    dispatch(fetchFindJobData());
  }, [dispatch]);

  const handleSearch = (newFilters: JobSearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleFilterChange = (changes: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <section
        className="relative pt-28 pb-16 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <div className="w-full md:flex-1">
              <SearchBar value={filters} onSearch={handleSearch} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-stretch">
            <div className="hidden lg:block rounded-[32px] border border-slate-200/60 bg-white/10 backdrop-blur-sm shadow-lg min-h-[260px]" />

            <div className="rounded-[24px] overflow-hidden border border-gray-200 shadow-[0_25px_80px_rgba(15,23,42,0.35)] bg-white">
              <Carousel autoplay arrows dots>
                <div>
                  <img
                    src={heroSlide}
                    alt="Tuyen dung"
                    className="w-full h-64 md:h-72 lg:h-[280px] object-cover"
                  />
                </div>
                <div>
                  <div className="relative h-64 md:h-72 lg:h-[280px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent)]" />
                    <div className="text-center z-10 px-6">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">
                        Part-Time Job Finder
                      </h2>
                      <p className="mt-2 text-lg md:text-xl text-blue-100">
                        Ket noi viec lam nhanh tren moi nen tang
                      </p>
                      <button
                        type="button"
                        className="ant-btn ant-btn-primary ant-btn-lg mt-6 bg-white text-sky-700 border-none hover:bg-blue-100"
                      >
                        <span>Tim hieu them</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative h-64 md:h-72 lg:h-[280px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-sky-900 text-white">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.4),_transparent)]" />
                    <div className="text-center z-10 px-6">
                      <h2 className="text-3xl md:text-4xl font-bold">
                        Tim viec sieu toc
                      </h2>
                      <p className="mt-2 text-lg md:text-xl text-blue-100">
                        Hang ngan co hoi moi duoc cap nhat moi ngay
                      </p>
                      <button
                        type="button"
                        className="ant-btn ant-btn-primary ant-btn-lg mt-6 bg-sky-500 border-none hover:bg-sky-400"
                      >
                        <span>Xem ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12 mt-8 lg:mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
          <div className="lg:col-span-3">
            <JobListSection
              filters={filters}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindJobPage;
