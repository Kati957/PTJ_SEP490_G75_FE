import React, { useEffect, useMemo, useState } from "react";
import { Select, Pagination, Spin, Empty, message, Button, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import jobPostService from "../../job/jobPostService";
import type { JobPostView } from "../../job/jobTypes";
import { formatTimeAgo } from "../../../utils/date";
import type { JobSearchFilters, SalaryFilter } from "../types";

const pageSize = 12;
type SortOrder = "newest" | "oldest" | "salaryDesc" | "salaryAsc";

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "Moi nhat", value: "newest" },
  { label: "Cu nhat", value: "oldest" },
  { label: "Luong cao den thap", value: "salaryDesc" },
  { label: "Luong thap den cao", value: "salaryAsc" },
];

const normalizeNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatSalary = (job: JobPostView) => {
  const salaryValue = job.salary && job.salary > 0 ? job.salary : null;
  if (salaryValue) {
    if (salaryValue >= 1_000_000) {
      const million = salaryValue / 1_000_000;
      const formatted =
        Number.isInteger(million) && million >= 1
          ? million.toFixed(0)
          : million.toFixed(1);
      return `${formatted} trieu VND`;
    }
    return `${salaryValue.toLocaleString("vi-VN")} VND`;
  }
  return job.salaryText || "Thoa thuan";
};

const JobListCard: React.FC<{ job: JobPostView }> = ({ job }) => {
  const navigate = useNavigate();
  const salaryText = formatSalary(job);
  const timeLabel = job.createdAt ? formatTimeAgo(job.createdAt) : "Moi dang";
  const locationText = job.location || "Dia diem dang cap nhat";
  const companyInitial = (job.employerName || job.title || "?")
    .charAt(0)
    .toUpperCase();
  const avatarSrc =
    job.employerAvatarUrl ||
    job.avatarUrl ||
    job.companyLogo ||
    (job as any).logo ||
    (job as any).logoUrl ||
    (job as any).employerAvatar ||
    (job as any).employerLogo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      job.employerName || job.title || companyInitial
    )}&background=059669&color=fff&size=128`;

  const handleNavigate = () => {
    navigate(`/viec-lam/chi-tiet/${job.employerPostId}`);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="flex items-start gap-4">
        <Avatar
          src={avatarSrc}
          alt={job.employerName}
          className="bg-emerald-50 text-emerald-600 font-semibold"
          style={{ width: 48, height: 48, borderRadius: 12 }}
        >
          {companyInitial}
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                {job.subCategoryName || job.categoryName || "Vi tri tuyen dung"}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600">
                {job.employerName || "Nha tuyen dung"}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center px-3 py-1 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full">
              {salaryText}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
              <span className="font-semibold text-emerald-600">Dia diem</span>
              {locationText}
            </span>
            {job.categoryName && (
              <span className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-full text-emerald-600">
                {job.categoryName}
              </span>
            )}
            {job.subCategoryName && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                {job.subCategoryName}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-full text-gray-700">
              Kinh nghiem: Linh hoat
            </span>
          </div>

          {job.description && (
            <p className="text-sm text-gray-600">
              {job.description.replace(/<[^>]+>/g, "").slice(0, 200)}
              {job.description.length > 200 ? "..." : ""}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{timeLabel}</span>
            </div>
            <Button
              type="primary"
              className="bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              Xem chi tiet
            </Button>
          </div>
        </div>
      </div>
    </div>
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

  const {
    keyword,
    provinceId,
    categoryId,
    subCategoryId,
    salary,
  } = filters;

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

  const matchesSalary = (value: SalaryFilter, job: JobPostView) => {
    const salaryValue =
      typeof job.salary === "number" && job.salary > 0 ? job.salary : null;

    if (value === "all") return true;
    if (value === "hasValue") return salaryValue !== null;
    if (value === "negotiable") return salaryValue === null;
    if (salaryValue === null) return false;

    const toMillions = salaryValue / 1_000_000;
    switch (value) {
      case "0-10":
        return toMillions < 10;
      case "10-15":
        return toMillions >= 10 && toMillions < 15;
      case "15-20":
        return toMillions >= 15 && toMillions < 20;
      case "20-25":
        return toMillions >= 20 && toMillions < 25;
      case "25+":
        return toMillions >= 25;
      default:
        return true;
    }
  };

  const filteredJobs = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      const titleMatch =
        !keywordLower ||
        job.title?.toLowerCase().includes(keywordLower) ||
        job.location?.toLowerCase().includes(keywordLower);

      const jobProvinceId = normalizeNumericId(
        job.provinceId ?? (job as any).provinceID ?? (job as any).provinceCode
      );
      const provinceMatch =
        provinceId === null ||
        provinceId === undefined ||
        jobProvinceId === provinceId;

      const jobCategoryId = normalizeNumericId(
        job.categoryId ?? (job as any).categoryID
      );
      const jobSubCategoryId = normalizeNumericId(
        job.subCategoryId ?? (job as any).subCategoryID
      );
      const categoryMatch =
        categoryId === null ||
        categoryId === undefined ||
        jobCategoryId === categoryId;

      const subCategoryMatch =
        subCategoryId === null ||
        subCategoryId === undefined ||
        jobSubCategoryId === subCategoryId;

      const salaryMatch = matchesSalary(salary, job);

      return (
        titleMatch &&
        provinceMatch &&
        categoryMatch &&
        subCategoryMatch &&
        salaryMatch
      );
    });
  }, [
    jobs,
    keyword,
    provinceId,
    categoryId,
    subCategoryId,
    salary,
  ]);

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

      return sortOrder === "salaryDesc"
        ? salaryB - salaryA
        : salaryA - salaryB;
    });
  }, [filteredJobs, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    keyword,
    provinceId,
    categoryId,
    subCategoryId,
    salary,
    sortOrder,
  ]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedJobs.slice(startIndex, startIndex + pageSize);
  }, [sortedJobs, currentPage]);

  const startItem =
    sortedJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(sortedJobs.length, currentPage * pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {sortedJobs.length} viec lam duoc tim thay
          </p>
          <p className="text-sm text-gray-500">
            {sortedJobs.length === 0
              ? "Khong co ket qua phu hop voi bo loc hien tai"
              : `Hien thi ${startItem}-${endItem}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sap xep theo:</span>
          <Select
            value={sortOrder}
            onChange={(value) => onSortChange(value as SortOrder)}
            options={sortOptions}
            className="w-full md:w-52"
            size="large"
          />
        </div>
      </div>

      <Spin spinning={loading}>
        {paginatedJobs.length === 0 ? (
          <Empty description="Chua co viec lam nao." />
        ) : (
          <div className="space-y-4">
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
