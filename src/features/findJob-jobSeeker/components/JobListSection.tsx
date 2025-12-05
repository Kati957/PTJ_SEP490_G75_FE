import { useEffect, useMemo, useState } from "react";
import { Card, Select, Pagination, Spin, Empty, message, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";
import jobPostService from "../../job/jobPostService";
import type { JobPostView } from "../../job/jobTypes";
import { formatTimeAgo } from "../../../utils/date";
import {
  getCompanyLogoSrc,
  getJobDetailCached,
  formatSalaryText,
} from "../../../utils/jobPostHelpers";
import type { JobSearchFilters } from "../types";
import matchService from "../../match/matchService";
import { getRepresentativeSalaryValue } from "../../../utils/salary";

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

const normalizeText = (value?: string | null): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const salaryToMillions = (salary?: number | null): number | null => {
  if (typeof salary !== "number" || salary <= 0) return null;
  return salary / 1_000_000;
};

const JobListCard: React.FC<{ job: JobPostView }> = ({ job }) => {
  const navigate = useNavigate();
  const salaryText = formatSalaryText(
    job.salaryMin,
    job.salaryMax,
    job.salaryType,
    job.salaryDisplay
  );
  const timeLabel = job.createdAt ? formatTimeAgo(job.createdAt) : "Chưa cập nhật";

  const descriptionText =
    job.description?.replaceAll(/<[^>]+>/g, "").slice(0, 180) || "";

  return (
    <Card
      key={job.employerPostId}
      className="shadow-sm border border-blue-50 hover:shadow-lg transition cursor-pointer rounded-2xl bg-white/95"
      onClick={() => navigate(`/viec-lam/chi-tiet/${job.employerPostId}`)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center border border-sky-100 shadow-sm overflow-hidden">
            {job.companyLogo ? (
              <img
                src={getCompanyLogoSrc(job.companyLogo)}
                alt={job.employerName || "Logo"}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sky-700 font-semibold bg-sky-50">
                {(job.employerName || "J").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-sm text-sky-600 font-medium">{job.employerName || "Nhà tuyển dụng"}</p>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {job.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeLabel}</span>
                <Button
                  type="primary"
                  size="middle"
                  className="bg-sky-600 hover:bg-sky-700 border-sky-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/viec-lam/chi-tiet/${job.employerPostId}`);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 mt-3">
              {job.location && (
                <Tag color="default" className="px-2 py-1 rounded-full text-gray-700">
                  {job.location}
                </Tag>
              )}
              {job.workHours && (
                <Tag color="blue" className="px-2 py-1 rounded-full">
                  {job.workHours}
                </Tag>
              )}
              <Tag color="blue" className="px-2 py-1 rounded-full font-semibold">
                {salaryText}
              </Tag>
              {job.categoryName && (
                <Tag color="default" className="px-2 py-1 rounded-full text-gray-700">
                  {job.categoryName}
                </Tag>
              )}
            </div>
            {descriptionText && (
              <p className="text-sm text-gray-600 mt-2">
                {descriptionText}
                {job.description && job.description.length > 180 ? "..." : ""}
              </p>
            )}
          </div>
        </div>
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

  const getApiMessage = (error: unknown): string | undefined => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      return err.response?.data?.message;
    }
    return undefined;
  };

  const {
    keyword,
    provinceId,
    categoryId,
    salary,
    salaryRange,
    salaryType,
  } = filters;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let data: JobPostView[] = [];
        const normalizedProvinceId =
          typeof provinceId === "number" && provinceId > 0 ? provinceId : null;

        const fetchAllJobs = async () => {
          const res = await jobPostService.getAllJobs();
          if (!res.success || !res.data) {
            setJobs([]);
            throw new Error("Không thể tải danh sách việc làm.");
          }
          return res.data;
        };

        const shouldQueryByProvince = Boolean(normalizedProvinceId);

        if (shouldQueryByProvince) {
          try {
            data = await matchService.searchJobsByProvince(
              normalizedProvinceId as number
            );
            if (!data || data.length === 0) {
              // fallback to all jobs if API returns nothing
              data = await fetchAllJobs();
            }
          } catch (provinceError) {
            console.warn("Match API failed, falling back to all jobs", provinceError);
            data = await fetchAllJobs();
          }
        } else {
          data = await fetchAllJobs();
        }

        const enriched = await Promise.all(
          data.map(async (job: JobPostView) => {
            let logo = job.companyLogo;
            if (!logo || !logo.trim()) {
              const detail = await getJobDetailCached(String(job.employerPostId));
              logo = detail?.companyLogo || undefined;
            }
            return { ...job, companyLogo: logo };
          })
        );
        setJobs(enriched);
      } catch (err) {
        message.error(
          getApiMessage(err) || "Không thể tải danh sách việc làm."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [provinceId]);

  const resolveSalaryValue = (job: JobPostView) =>
    getRepresentativeSalaryValue(job.salaryMin, job.salaryMax);

  const filteredJobs = useMemo(() => {
    const keywordNormalized = normalizeText(keyword);

    return jobs.filter((job) => {
      const titleMatch =
        !keywordNormalized ||
        normalizeText(job.title).includes(keywordNormalized) ||
        normalizeText(job.location).includes(keywordNormalized);

      const provinceMatch =
        provinceId === null ||
        provinceId === undefined ||
        job.provinceId === provinceId ||
        normalizeNumericId(job.provinceId) === normalizeNumericId(provinceId);

      const categoryMatch =
        !categoryId ||
        job.categoryId === categoryId ||
        (filters.categoryName &&
          normalizeText(job.categoryName) === normalizeText(filters.categoryName));

      const numericSalary = resolveSalaryValue(job);

      let salaryPresenceMatch = true;
      if (salary === "hasValue") {
        salaryPresenceMatch = numericSalary !== null;
      } else if (salary === "negotiable") {
        salaryPresenceMatch = numericSalary === null;
      }

      const salaryMillions =
        typeof numericSalary === "number"
          ? salaryToMillions(numericSalary)
          : null;

      let salaryRangeMatch = true;
      switch (salaryRange) {
        case "under1":
          salaryRangeMatch = salaryMillions !== null && salaryMillions < 1;
          break;
        case "1-3":
          salaryRangeMatch = salaryMillions !== null && salaryMillions >= 1 && salaryMillions <= 3;
          break;
        case "3-5":
          salaryRangeMatch = salaryMillions !== null && salaryMillions > 3 && salaryMillions <= 5;
          break;
        case "5plus":
          salaryRangeMatch = salaryMillions !== null && salaryMillions > 5;
          break;
        case "negotiable":
          salaryRangeMatch = numericSalary == null;
          break;
        default:
          salaryRangeMatch = true;
      }

      const salaryTypeValue = salaryType ?? "all";
      const salaryTypeMatch =
        salaryTypeValue === "all" || job.salaryType === salaryTypeValue;

      return (
        titleMatch &&
        provinceMatch &&
        categoryMatch &&
        salaryPresenceMatch &&
        salaryRangeMatch &&
        salaryTypeMatch
      );
    });
  }, [
    jobs,
    keyword,
    provinceId,
    categoryId,
    salary,
    salaryRange,
    salaryType,
    filters.categoryName,
  ]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortOrder === "newest" || sortOrder === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      }

      const salaryA = resolveSalaryValue(a);
      const salaryB = resolveSalaryValue(b);

      if (salaryA === null && salaryB === null) return 0;
      if (salaryA === null) return 1;
      if (salaryB === null) return -1;

      return sortOrder === "salaryDesc" ? salaryB - salaryA : salaryA - salaryB;
    });
  }, [filteredJobs, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    keyword,
    provinceId,
    categoryId,
    salary,
    salaryRange,
    salaryType,
    sortOrder,
  ]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedJobs.slice(startIndex, startIndex + pageSize);
  }, [sortedJobs, currentPage]);

  const startDisplay = sortedJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endDisplay = Math.min(currentPage * pageSize, sortedJobs.length);

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="text-gray-700">
          <span className="font-semibold">{sortedJobs.length}</span> việc làm được tìm thấy{" "}
          {sortedJobs.length > 0 && (
            <span className="text-sm text-gray-500">
              (Hiển thị {startDisplay}-{endDisplay})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sắp xếp theo:</span>
          <Select
            value={sortOrder}
            onChange={(value) => onSortChange(value as SortOrder)}
            options={sortOptions}
            className="w-44"
            size="middle"
          />
        </div>
      </div>
      <Spin spinning={loading}>
        {paginatedJobs.length === 0 ? (
          <Empty description="Chưa có việc làm nào." />
        ) : (
          <div className="space-y-3">
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
