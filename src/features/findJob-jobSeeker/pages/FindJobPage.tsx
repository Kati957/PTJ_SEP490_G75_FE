import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"; // Dùng useLocation thay vì useSearchParams
import { fetchFindJobData } from "../slice";
import type { AppDispatch } from "../../../app/store";
import { SearchBar } from "../components/SearchBar";
import { JobFilters } from "../components/JobFilters";
import JobListSection from "../components/JobListSection";
import type { JobSearchFilters } from "../types";

const DEFAULT_FILTERS: JobSearchFilters = {
  keyword: "",
  provinceId: null,
  categoryId: null,
  categoryName: null,
  subCategoryId: null,
  subCategoryName: null,
  salary: "all",
  salaryRange: "all",
};

const FindJobPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation(); // Lấy state từ router
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_FILTERS);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "salaryDesc" | "salaryAsc"
  >("newest");

  useEffect(() => {
    dispatch(fetchFindJobData());
  }, [dispatch]);

  useEffect(() => {
    const stateFilters = location.state as Partial<JobSearchFilters> | null;
    if (stateFilters && Object.keys(stateFilters).length > 0) {
      setFilters((prev) => ({
        ...prev,
        ...stateFilters,
      }));

      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSearch = (newFilters: JobSearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleFilterChange = (partial: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-700 pt-8 pb-16">
        <div className="container mx-auto px-4">
          <SearchBar value={filters} onSearch={handleSearch} />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72">
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
          <div className="flex-1">
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
