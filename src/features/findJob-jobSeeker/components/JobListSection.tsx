import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Pagination, Spin, Empty, message } from "antd";
import { useNavigate } from "react-router-dom";
import jobPostService from "../../job/jobPostService";
import type { JobPostView } from "../../job/jobTypes";
import { formatTimeAgo } from "../../../utils/date";
import type { JobSearchFilters } from "../types";

const pageSize = 12;
type SortOrder = "newest" | "oldest" | "salaryDesc" | "salaryAsc";

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Lương cao đến thấp", value: "salaryDesc" },
  { label: "Lương thấp đến cao", value: "salaryAsc" },
];

const normalizeNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const JobListCard: React.FC<{ job: JobPostView }> = ({ job }) => {
  const navigate = useNavigate();
  const salaryText =
    job.salary && job.salary > 0
      ? `${job.salary.toLocaleString("vi-VN")} VND`
      : job.salaryText || "Thoa thuan";
  const timeLabel = job.createdAt
    ? formatTimeAgo(job.createdAt)
    : "Chua co thoi gian";

  return (
    <Card
      key={job.employerPostId}
      className="shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/viec-lam/chi-tiet/${job.employerPostId}`)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">
              {job.categoryName || "Chưa rõ ngành nghề"}
            </p>
          </div>
          <span className="text-xs text-gray-400">{timeLabel}</span>
        </div>

        <div className="text-sm text-gray-700 flex flex-wrap gap-4">
          <span>
            <i className="fas fa-map-marker-alt mr-1 text-indigo-500" />
            {job.location || "Chua cap nhat dia diem"}
          </span>
          <span className="text-red-600 font-semibold">{salaryText}</span>
        </div>

        {job.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.description.replaceAll(/<[^>]+>/g, "").slice(0, 200)}
            {job.description.length > 200 ? "..." : ""}
          </p>
        )}
      </div>
    </Card>
  );
};

interface JobListSectionProps {
  filters: JobSearchFilters;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

const JobListSection: React.FC<JobListSectionProps> = ({
  filters,
  sortOrder,
  onSortChange,
}) => {
  const [jobs, setJobs] = useState<JobPostView[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { keyword, provinceId, categoryId, subCategoryId, salary } = filters;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await jobPostService.getAllJobs();
        if (res.success) {
          setJobs(res.data || []);
        } else {
          message.error("Khong the tai danh sach viec lam.");
        }
      } catch (err: any) {
        message.error(
          err.response?.data?.message || "Khong the tai danh sach viec lam."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      const titleMatch =
        !keywordLower ||
        job.title?.toLowerCase().includes(keywordLower) ||
        job.location?.toLowerCase().includes(keywordLower);

      const provinceMatch =
        provinceId === null ||
        provinceId === undefined ||
        job.provinceId === provinceId;

      const categoryMatch =
        !categoryId ||
        (filters.categoryName && job.categoryName === filters.categoryName);

      const subCategoryMatch =
        !subCategoryId ||
        (filters.subCategoryName &&
          job.subCategoryName === filters.subCategoryName);

      let salaryMatch = true;
      if (salary === "hasValue") {
        salaryMatch = !!job.salary && job.salary > 0;
      } else if (salary === "negotiable") {
        salaryMatch = !job.salary || job.salary <= 0;
      }

      return (
        titleMatch &&
        provinceMatch &&
        categoryMatch &&
        subCategoryMatch &&
        salaryMatch
      );
    });
  }, [jobs, keyword, provinceId, categoryId, subCategoryId, salary]);

  const sortedJobs = useMemo(() => {
    const getSalaryValue = (job: JobPostView) =>
      typeof job.salary === "number" && job.salary > 0 ? job.salary : null;

    return [...filteredJobs].sort((a, b) => {
      if (sortOrder === "newest" || sortOrder === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      }

      const salaryA = getSalaryValue(a);
      const salaryB = getSalaryValue(b);

      if (salaryA === null && salaryB === null) return 0;
      if (salaryA === null) return 1;
      if (salaryB === null) return -1;

      return sortOrder === "salaryDesc" ? salaryB - salaryA : salaryA - salaryB;
    });
  }, [filteredJobs, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, provinceId, categoryId, subCategoryId, salary, sortOrder]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedJobs.slice(startIndex, startIndex + pageSize);
  }, [sortedJobs, currentPage]);

  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Việc làm hiện hành</h2>
        <div className="w-full sm:w-auto">
          <Select
            value={sortOrder}
            onChange={(value) => onSortChange(value as SortOrder)}
            options={sortOptions}
            className="w-full sm:w-48"
            size="large"
          />
        </div>
      </div>
      <Spin spinning={loading}>
        {paginatedJobs.length === 0 ? (
          <Empty description="Chưa có việc làm nào." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedJobs.map((job) => (
              <JobListCard key={job.employerPostId} job={job} />
            ))}
          </div>
        )}
      </Spin>

      <div className="flex justify-center mt-6">
        <Pagination
          current={currentPage}
          total={sortedJobs.length}
          pageSize={pageSize}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default JobListSection;
