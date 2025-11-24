import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"; // Dùng useLocation thay vì useSearchParams
import { fetchFindJobData } from "../slice";
import type { AppDispatch } from "../../../app/store";
import { SearchBar } from "../components/SearchBar";
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
    if (location.state && location.state.categoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryId: location.state.categoryId,
        categoryName: location.state.categoryName,
      }));

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleSearch = (newFilters: JobSearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar value={filters} onSearch={handleSearch} />
      <JobListSection
        filters={filters}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
    </div>
  );
};

export default FindJobPage;
