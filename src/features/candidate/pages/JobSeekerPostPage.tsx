import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Space,
  message,
  Button,
  Modal,
  Tag,
  Input,
  Select,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
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
import locationService, {
  type LocationOption,
} from "../../location/locationService";

const trimText = (value?: string | null): string => (value ?? "").trim();

const hasValue = (value?: string | null): boolean => trimText(value).length > 0;

const normalizeTimeValue = (value?: string | null): string => {
  const trimmed = trimText(value);
  if (!trimmed) {
    return "";
  }
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
  if (direct) {
    return direct;
  }
  const fallback = trimText(
    (post as { contactPhone?: string | null }).contactPhone
  );
  return fallback;
};

const hasWorkHourData = (post: JobSeekerPostDtoOut): boolean => {
  return (
    hasValue(post.preferredWorkHours) ||
    hasValue(post.preferredWorkHourStart) ||
    hasValue(post.preferredWorkHourEnd)
  );
};

const DESCRIPTION_BUTTON_THRESHOLD = 120;

const shouldFetchDetail = (post: JobSeekerPostDtoOut): boolean => {
  const hasContact = Boolean(getContactPhone(post));
  const hasGender = hasValue(post.gender);
  const hasAge = typeof post.age === "number" && post.age > 0;
  return !(hasWorkHourData(post) && hasContact && hasGender && hasAge);
};

const shouldShowDescriptionButton = (description?: string | null): boolean => {
  return trimText(description).length > DESCRIPTION_BUTTON_THRESHOLD;
};

const getCvIdFromPost = (post: JobSeekerPostDtoOut): number | null => {
  const extended = post as {
    selectedCvId?: number | null;
    cvId?: number | null;
  };
  return extended.selectedCvId ?? extended.cvId ?? null;
};

const { Search } = Input;
const { Option } = Select;

const JobSeekerPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<JobSeekerPostDtoOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [descriptionModal, setDescriptionModal] = useState<{
    isOpen: boolean;
    post: JobSeekerPostDtoOut | null;
  }>({
    isOpen: false,
    post: null,
  });
  const [cvModal, setCvModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
  }>({
    isOpen: false,
    loading: false,
    cv: null,
    error: null,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);

  const { categories, status: categoryStatus } = useCategories();

  const formatWorkHours = (record: JobSeekerPostDtoOut) => {
    if (hasValue(record.preferredWorkHours)) {
      return trimText(record.preferredWorkHours);
    }
    const start = normalizeTimeValue(record.preferredWorkHourStart);
    const end = normalizeTimeValue(record.preferredWorkHourEnd);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || "";
  };

  const hydratePostsWithDetails = useCallback(
    async (rawPosts: JobSeekerPostDtoOut[]) => {
      const pendingDetails = rawPosts.filter(shouldFetchDetail);
      if (!pendingDetails.length) {
        return rawPosts;
      }

      const detailMap = new Map<number, JobSeekerPostDtoOut>();
      const batchSize = 10;

      for (let i = 0; i < pendingDetails.length; i += batchSize) {
        const batch = pendingDetails.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (post) => {
            try {
              const response = await jobSeekerPostService.getJobSeekerPostById(
                post.jobSeekerPostId
              );
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
          if (detail) {
            detailMap.set(detail.jobSeekerPostId, detail);
          }
        });
      }

      if (!detailMap.size) {
        return rawPosts;
      }

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
        const titleMatch = trimText(post.title)
          .toLowerCase()
          .includes(keyword);
        const nameMatch = trimText(post.seekerName)
          .toLowerCase()
          .includes(keyword);
        return titleMatch || nameMatch;
      });
    }

    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (cat) => cat.categoryId === selectedCategoryId
      );
      if (selectedCategory) {
        data = data.filter(
          (post) =>
            trimText(post.categoryName).toLowerCase() ===
            trimText(selectedCategory.name).toLowerCase()
        );
      }
    }

    if (selectedProvinceCode) {
      const selectedProvince = provinceOptions.find(
        (province) => province.code === selectedProvinceCode
      );
      if (selectedProvince) {
        const provinceName = selectedProvince.name.toLowerCase();
        data = data.filter((post) =>
          trimText(post.preferredLocation)
            .toLowerCase()
            .includes(provinceName)
        );
      }
    }

    return data;
  }, [
    posts,
    searchValue,
    selectedCategoryId,
    categories,
    selectedProvinceCode,
    provinceOptions,
  ]);

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

  const handleTableChange: TableProps<JobSeekerPostDtoOut>["onChange"] = (
    newPagination
  ) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
  };

  const handleViewCv = useCallback(
    async (post: JobSeekerPostDtoOut) => {
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
    },
    []
  );

  const columns: TableColumnsType<JobSeekerPostDtoOut> = [
    {
      title: "Tên bài đăng",
      dataIndex: "title",
      key: "title",
      width: 220,
      ellipsis: true,
      sorter: (a, b) => trimText(a.title).localeCompare(trimText(b.title)),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => (
        <div className="max-w-[200px]">
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">
              {record.seekerName || "Người đăng ẩn"}
            </span>{" "}
            • {record.gender ?? "Không rõ"} •{" "}
            {record.age ? `${record.age} tuổi` : "Tuổi N/A"}
          </div>
          <span className="font-semibold text-blue-600 truncate block">
            {text}
          </span>
          <div className="text-xs text-gray-500">
            Ngày đăng:{" "}
            {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 140,
      ellipsis: true,
      sorter: (a, b) =>
        trimText(a.categoryName).localeCompare(trimText(b.categoryName)),
      sortDirections: ["ascend", "descend"],
      render: (cat) => cat || "Chưa chọn",
    },
    {
      title: "Địa điểm",
      dataIndex: "preferredLocation",
      key: "preferredLocation",
      width: 420,
      render: (loc) => (
        <Space className="max-w-[400px]">
          <EnvironmentOutlined />
          <span
            className="block"
            style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            {loc || "Không rõ địa điểm"}
          </span>
        </Space>
      ),
    },
    {
      title: "Giờ làm mong muốn",
      dataIndex: "preferredWorkHours",
      key: "preferredWorkHours",
      width: 160,
      align: "center",
      render: (_, record) => {
        const hours = formatWorkHours(record);
        return (
          <Space>
            <ClockCircleOutlined /> {hours || "Không rõ"}
          </Space>
        );
      },
    },
    {
      title: "Liên hệ",
      dataIndex: "phoneContact",
      key: "phoneContact",
      width: 150,
      render: (_, record) => {
        const phone = getContactPhone(record);
        return (
          <Space>
            <PhoneOutlined />
            <span className="whitespace-nowrap font-medium">
              {phone || "N/A"}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      align: "center",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ["descend", "ascend"],
      render: (createdAt: string) => (
        <Space>
          <ClockCircleOutlined />{" "}
          {createdAt
            ? new Date(createdAt).toLocaleDateString("vi-VN")
            : "N/A"}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      key: "description",
      width: 220,
      render: (_, record) => {
        const desc = trimText(record.description);
        if (!desc) {
          return <span className="text-gray-500">Chưa có mô tả</span>;
        }

        const showButton = shouldShowDescriptionButton(record.description);

        return (
          <div className="max-w-[200px]">
            <span
              title={desc}
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {desc}
            </span>
            {showButton && (
              <Button
                type="link"
                size="small"
                className="p-0"
                onClick={() =>
                  setDescriptionModal({ isOpen: true, post: record })
                }
              >
                Xem thêm
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "CV",
      key: "cv",
      width: 120,
      align: "center",
      render: (_, record) => {
        const cvId = getCvIdFromPost(record);
        return (
          <Button
            type="link"
            size="small"
            disabled={!cvId}
            onClick={() => handleViewCv(record)}
          >
            Xem CV
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Danh sách bài đăng tìm việc
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">

  {/* Ô tìm kiếm */}
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

  {/* Lọc ngành nghề */}
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

  {/* Lọc theo tỉnh/thành phố */}
  <Select
    placeholder="Thành phố"
    allowClear
    showSearch
    optionFilterProp="children"
    value={selectedProvinceCode ?? undefined}
    onChange={(value) =>
      handleProvinceChange(value as number | undefined)
    }
    loading={provinceLoading}
    className="w-full md:w-1/4"
    filterOption={(input, option) =>
      (option?.children as string)
        .toLowerCase()
        .includes(input.toLowerCase())
    }
  >
    {provinceOptions.map((province) => (
      <Option key={province.code} value={province.code}>
        {province.name}
      </Option>
    ))}
  </Select>
</div>

        <Table
          rowKey="jobSeekerPostId"
          columns={columns}
          dataSource={filteredPosts}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredPosts.length,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />

        {/* Modal mô tả bài đăng */}
        <Modal
          title={descriptionModal.post?.title || "Mô tả chi tiết"}
          open={descriptionModal.isOpen}
          footer={null}
          onCancel={() =>
            setDescriptionModal({ isOpen: false, post: null })
          }
          width={600}
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              {descriptionModal.post?.seekerName}
            </div>
            <p className="whitespace-pre-wrap">
              {descriptionModal.post?.description || "Chưa có mô tả chi tiết."}
            </p>
          </div>
        </Modal>

        {/* Modal CV */}
        <Modal
          title={cvModal.cv?.cvTitle || "CV ứng viên"}
          open={cvModal.isOpen}
          footer={null}
          onCancel={() =>
            setCvModal({
              isOpen: false,
              loading: false,
              cv: null,
              error: null,
            })
          }
          width={650}
        >
          {cvModal.loading ? (
            <p>Đang tải CV...</p>
          ) : cvModal.error ? (
            <p className="text-red-500">{cvModal.error}</p>
          ) : cvModal.cv ? (
            <div className="space-y-4 text-sm">
              {/* Thông tin chung */}
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">
                  Thông tin chung
                </h3>
                <p>
                  <span className="font-semibold">Tiêu đề:</span>{" "}
                  {cvModal.cv.cvTitle}
                </p>
                {cvModal.cv.preferredJobType && (
                  <p>
                    <span className="font-semibold">
                      Công việc mong muốn:
                    </span>{" "}
                    {cvModal.cv.preferredJobType}
                  </p>
                )}
                {cvModal.cv.preferredLocationName && (
                  <p>
                    <span className="font-semibold">Khu vực mong muốn:</span>{" "}
                    {cvModal.cv.preferredLocationName}
                  </p>
                )}
                {cvModal.cv.contactPhone && (
                  <p>
                    <span className="font-semibold">Liên hệ:</span>{" "}
                    {cvModal.cv.contactPhone}
                  </p>
                )}
              </div>

              {/* Kỹ năng */}
              {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Kỹ năng
                  </h3>
                  {cvModal.cv.skillSummary && (
                    <p className="text-gray-700">
                      {cvModal.cv.skillSummary}
                    </p>
                  )}
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

              {/* Kinh nghiệm (nếu có trong type) */}
              {(cvModal.cv as any).experience && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Kinh nghiệm
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {(cvModal.cv as any).experience}
                  </p>
                </div>
              )}

              {/* Học vấn (nếu có) */}
              {(cvModal.cv as any).education && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Học vấn
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {(cvModal.cv as any).education}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 text-right">
                Cập nhật:{" "}
                {new Date(cvModal.cv.updatedAt).toLocaleDateString("vi-VN")}
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
