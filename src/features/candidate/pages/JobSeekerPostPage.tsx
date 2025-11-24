import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Pagination,
  message,
  Avatar,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { jobSeekerPostService } from "../services";
import jobSeekerCvService from "../../jobSeekerCv/services";
import type { JobSeekerPostDtoOut } from "../type";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import { useCategories } from "../../category/hook";
import locationService, { type LocationOption } from "../../location/locationService";

const { Search } = Input;
const { Option } = Select;

const trimText = (value?: string | null): string => (value ?? "").trim();
const hasValue = (value?: string | null): boolean => trimText(value).length > 0;
const normalizeTimeValue = (value?: string | null): string => {
  const trimmed = trimText(value);
  if (!trimmed) return "";
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const [, hour, minute] = timeMatch;
    const normalizedHour = hour.padStart(2, "0").slice(-2);
    const normalizedMinute = minute.padStart(2, "0").slice(0, 2);
    return `${normalizedHour}:${normalizedMinute}`;
  }
  return trimmed;
};

const getContactPhone = (post: JobSeekerPostDtoOut): string => {
  const direct = trimText(post.phoneContact);
  if (direct) return direct;
  const fallback = trimText((post as { contactPhone?: string | null }).contactPhone);
  return fallback;
};

const hasWorkHourData = (post: JobSeekerPostDtoOut): boolean =>
  hasValue(post.preferredWorkHours) ||
  hasValue(post.preferredWorkHourStart) ||
  hasValue(post.preferredWorkHourEnd);

const shouldFetchDetail = (post: JobSeekerPostDtoOut): boolean => {
  const hasContact = Boolean(getContactPhone(post));
  const hasGender = hasValue(post.gender);
  const hasAge = typeof post.age === "number" && post.age > 0;
  return !(hasWorkHourData(post) && hasContact && hasGender && hasAge);
};

const getCvIdFromPost = (post: JobSeekerPostDtoOut): number | null => {
  const extended = post as { selectedCvId?: number | null; cvId?: number | null };
  return extended.selectedCvId ?? extended.cvId ?? null;
};

const DESCRIPTION_SNIPPET = 150;

const JobSeekerPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<JobSeekerPostDtoOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [descriptionModal, setDescriptionModal] = useState<{
    isOpen: boolean;
    post: JobSeekerPostDtoOut | null;
  }>({ isOpen: false, post: null });
  const [cvModal, setCvModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
  }>({ isOpen: false, loading: false, cv: null, error: null });
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [sortOption, setSortOption] = useState<"latest" | "oldest" | "name">("latest");

  const { categories, status: categoryStatus } = useCategories();

  const formatWorkHours = (record: JobSeekerPostDtoOut) => {
    if (hasValue(record.preferredWorkHours)) {
      return trimText(record.preferredWorkHours);
    }
    const start = normalizeTimeValue(record.preferredWorkHourStart);
    const end = normalizeTimeValue(record.preferredWorkHourEnd);
    if (start && end) return `${start} - ${end}`;
    return start || end || "";
  };

  const hydratePostsWithDetails = useCallback(
    async (rawPosts: JobSeekerPostDtoOut[]) => {
      const pendingDetails = rawPosts.filter(shouldFetchDetail);
      if (!pendingDetails.length) return rawPosts;

      const detailMap = new Map<number, JobSeekerPostDtoOut>();
      const batchSize = 10;

      for (let i = 0; i < pendingDetails.length; i += batchSize) {
        const batch = pendingDetails.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (post) => {
            try {
              const response = await jobSeekerPostService.getJobSeekerPostById(post.jobSeekerPostId);
              if (response.success && response.data) {
                return response.data;
              }
            } catch {
              return null;
            }
            return null;
          })
        );

        batchResults.forEach((detail) => {
          if (detail) detailMap.set(detail.jobSeekerPostId, detail);
        });
      }

      if (!detailMap.size) return rawPosts;
      return rawPosts.map((post) => {
        const detail = detailMap.get(post.jobSeekerPostId);
        return detail ? { ...post, ...detail } : post;
      });
    },
    []
  );

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await jobSeekerPostService.getAllJobSeekerPosts();
      if (res.success) {
        const enrichedPosts = await hydratePostsWithDetails(res.data);
        setPosts(enrichedPosts);
      } else {
        setPosts([]);
      }
    } catch {
      message.error("Không thể tải danh sách bài đăng tìm việc.");
    } finally {
      setIsLoading(false);
    }
  }, [hydratePostsWithDetails]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const loadProvinces = async () => {
      setProvinceLoading(true);
      try {
        const data = await locationService.getProvinces();
        setProvinceOptions(data);
      } catch {
        message.error("Không thể tải danh sách tỉnh/thành phố.");
      } finally {
        setProvinceLoading(false);
      }
    };
    void loadProvinces();
  }, []);

  const filteredPosts = useMemo(() => {
    let data = [...posts];

    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      data = data.filter((post) => {
        const titleMatch = trimText(post.title).toLowerCase().includes(keyword);
        const nameMatch = trimText(post.seekerName).toLowerCase().includes(keyword);
        return titleMatch || nameMatch;
      });
    }

    if (selectedCategoryId) {
      const selectedCategory = categories.find((cat) => cat.categoryId === selectedCategoryId);
      if (selectedCategory) {
        data = data.filter(
          (post) =>
            trimText(post.categoryName).toLowerCase() === trimText(selectedCategory.name).toLowerCase()
        );
      }
    }

    if (selectedProvinceCode) {
      const selectedProvince = provinceOptions.find((province) => province.code === selectedProvinceCode);
      if (selectedProvince) {
        const provinceName = selectedProvince.name.toLowerCase();
        data = data.filter((post) => trimText(post.preferredLocation).toLowerCase().includes(provinceName));
      }
    }

    return data;
  }, [posts, searchValue, selectedCategoryId, categories, selectedProvinceCode, provinceOptions]);

  const sortedPosts = useMemo(() => {
    const data = [...filteredPosts];
    if (sortOption === "name") {
      data.sort((a, b) => trimText(a.title).localeCompare(trimText(b.title)));
    } else {
      data.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOption === "latest" ? timeB - timeA : timeA - timeB;
      });
    }
    return data;
  }, [filteredPosts, sortOption]);

  const paginatedPosts = useMemo(() => {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [sortedPosts, pagination]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategoryId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleProvinceChange = (value: number | undefined) => {
    setSelectedProvinceCode(typeof value === "number" ? value : null);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleViewCv = useCallback(async (post: JobSeekerPostDtoOut) => {
    const cvId = getCvIdFromPost(post);
    if (!cvId) {
      message.info("Bài đăng này chưa đính kèm CV.");
      return;
    }
    setCvModal({ isOpen: true, loading: true, cv: null, error: null });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(cvId);
      setCvModal({ isOpen: true, loading: false, cv, error: null });
    } catch {
      setCvModal({
        isOpen: true,
        loading: false,
        cv: null,
        error: "Không thể tải CV. Vui lòng thử lại sau.",
      });
    }
  }, []);

  const formatRelativeDate = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Cập nhật hôm nay";
    if (days === 1) return "Cập nhật 1 ngày trước";
    return `Cập nhật ${days} ngày trước`;
  };

  const renderCard = (post: JobSeekerPostDtoOut) => {
    const initials =
      trimText(post.seekerName || "UV")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "UV";
    const hours = formatWorkHours(post);
    const desc = trimText(post.description);
    const cvId = getCvIdFromPost(post);

    return (
      <div
        key={post.jobSeekerPostId}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 flex flex-col gap-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar
              className="bg-emerald-500"
              size={48}
              src={post.avatarUrl || post.avatar || undefined}
            >
              {initials}
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{post.categoryName || "Ngành nghề"}</p>
              <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                {post.title || "Chưa đặt tiêu đề"}
              </h3>
              <p className="text-sm text-slate-600">{post.seekerName || "Ứng viên ẩn danh"}</p>
            </div>
          </div>
          <Tag color="success" className="text-sm px-3 py-1 rounded-full">
            Thỏa thuận
          </Tag>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tag color="blue" className="rounded-full px-3 py-1">
            <span className="font-semibold">Địa điểm</span>{" "}
            {post.preferredLocation || "Chưa cập nhật"}
          </Tag>
          {post.categoryName && (
            <Tag className="rounded-full px-3 py-1 bg-slate-100 text-slate-700 border-slate-200">
              {post.categoryName}
            </Tag>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-700">
          <Tag className="bg-slate-100 text-slate-700 border-slate-200 rounded-full px-3 py-1">
            Kinh nghiệm: Linh hoạt
          </Tag>
          {hours && (
            <Tag className="bg-slate-100 text-slate-700 border-slate-200 rounded-full px-3 py-1">
              Giờ làm: {hours}
            </Tag>
          )}
        </div>

        {desc && (
          <p className="text-sm text-slate-700">
            {desc.length > DESCRIPTION_SNIPPET ? `${desc.slice(0, DESCRIPTION_SNIPPET)}...` : desc}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatRelativeDate(post.createdAt)}</span>
          <div className="flex gap-2">
            <Button size="small" onClick={() => setDescriptionModal({ isOpen: true, post })}>
              Xem chi tiết
            </Button>
            <Button size="small" type="primary" disabled={!cvId} onClick={() => handleViewCv(post)}>
              Xem CV
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 text-white shadow-lg">
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative p-6 lg:p-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">Ứng viên</p>
          <h1 className="text-2xl lg:text-3xl font-bold">Danh sách bài đăng tìm việc của ứng viên</h1>
          <p className="text-white/80 max-w-3xl">
            Khám phá hồ sơ ứng viên, xem nhanh mô tả và CV đính kèm để kết nối nhanh chóng.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/20">
              Tổng bài đăng: <strong>{sortedPosts.length}</strong>
            </span>
            <span className="px-3 py-2 rounded-lg bg-white/10 border border-white/20">
              Hiển thị {(pagination.current - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.current * pagination.pageSize, sortedPosts.length)}
            </span>
          </div>
        </div>
      </section>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <Search
            placeholder="Tìm kiếm bài đăng hoặc tên ứng viên..."
            allowClear
            enterButton
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onSearch={handleSearchChange}
            loading={isLoading}
            className="w-full md:w-1/3"
          />

          <Select
            placeholder="Ngành nghề"
            allowClear
            value={selectedCategoryId ?? undefined}
            onChange={(value) => handleCategoryChange(value ?? null)}
            loading={categoryStatus === "loading"}
            className="w-full md:w-1/4"
          >
            {categories.map((cat) => (
              <Option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Tỉnh / Thành"
            allowClear
            showSearch
            optionFilterProp="children"
            value={selectedProvinceCode ?? undefined}
            onChange={(value) => handleProvinceChange(value as number | undefined)}
            loading={provinceLoading}
            className="w-full md:w-1/4"
            filterOption={(input, option) =>
              String(option?.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            {provinceOptions.map((province) => (
              <Option key={province.code} value={province.code}>
                {province.name}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800">{sortedPosts.length} việc làm được tìm thấy</p>
            <p className="text-sm text-slate-500">
              Hiển thị {(pagination.current - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.current * pagination.pageSize, sortedPosts.length)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Sắp xếp theo:</span>
            <Select
              value={sortOption}
              onChange={(val) => {
                setSortOption(val);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{ width: 160 }}
            >
              <Option value="latest">Mới nhất</Option>
              <Option value="oldest">Cũ nhất</Option>
              <Option value="name">Tiêu đề A-Z</Option>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p>Đang tải...</p>
          ) : paginatedPosts.length === 0 ? (
            <p className="text-slate-500">Chưa có bài đăng phù hợp.</p>
          ) : (
            paginatedPosts.map(renderCard)
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={sortedPosts.length}
            onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
            showSizeChanger
          />
        </div>

        <Modal
          title={descriptionModal.post?.title || "Mô tả chi tiết"}
          open={descriptionModal.isOpen}
          footer={null}
          onCancel={() => setDescriptionModal({ isOpen: false, post: null })}
          width={600}
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{descriptionModal.post?.seekerName}</div>
            <p className="whitespace-pre-wrap">
              {descriptionModal.post?.description || "Chưa có mô tả chi tiết."}
            </p>
          </div>
        </Modal>

        <Modal
          title={cvModal.cv?.cvTitle || "CV ứng viên"}
          open={cvModal.isOpen}
          footer={null}
          onCancel={() => setCvModal({ isOpen: false, loading: false, cv: null, error: null })}
          width={650}
        >
          {cvModal.loading ? (
            <p>Đang tải CV...</p>
          ) : cvModal.error ? (
            <p className="text-red-500">{cvModal.error}</p>
          ) : cvModal.cv ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">Thông tin chung</h3>
                <p>
                  <span className="font-semibold">Tiêu đề:</span> {cvModal.cv.cvTitle}
                </p>
                {cvModal.cv.preferredJobType && (
                  <p>
                    <span className="font-semibold">Công việc mong muốn:</span> {cvModal.cv.preferredJobType}
                  </p>
                )}
                {cvModal.cv.preferredLocationName && (
                  <p>
                    <span className="font-semibold">Khu vực mong muốn:</span> {cvModal.cv.preferredLocationName}
                  </p>
                )}
                {cvModal.cv.contactPhone && (
                  <p>
                    <span className="font-semibold">Liên hệ:</span> {cvModal.cv.contactPhone}
                  </p>
                )}
              </div>

              {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Kỹ năng</h3>
                  {cvModal.cv.skillSummary && <p className="text-gray-700">{cvModal.cv.skillSummary}</p>}
                  {cvModal.cv.skills && (
                    <div className="mt-2">
                      {cvModal.cv.skills.split(",").map((skill, idx) => (
                        <Tag key={idx} color="blue" className="mb-1">
                          {skill.trim()}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(cvModal.cv as any).experience && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Kinh nghiệm</h3>
                  <p className="whitespace-pre-wrap text-gray-700">{(cvModal.cv as any).experience}</p>
                </div>
              )}

              {(cvModal.cv as any).education && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Học vấn</h3>
                  <p className="whitespace-pre-wrap text-gray-700">{(cvModal.cv as any).education}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 text-right">
                Cập nhật: {new Date(cvModal.cv.updatedAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ) : (
            <p>Không tìm thấy CV.</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default JobSeekerPostsPage;
