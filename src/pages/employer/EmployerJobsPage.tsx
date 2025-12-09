import React, { useState, useEffect, useMemo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Input,
  Row,
  Col,
  List,
  Progress,
  Avatar,
  Typography,
  Tooltip,
  Dropdown,
} from "antd";
import type { TableProps, TableColumnsType, MenuProps } from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  AppstoreOutlined,
  BulbOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LockOutlined,
  UnlockOutlined,
  MoreOutlined,
  ReloadOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView, JobSuggestionDto } from "../../features/job/jobTypes";
import { useCategories } from "../../features/category/hook";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import type { Category } from "../../features/category/type";
import { JobPostDetailModal } from "../../features/job/components/employer/JobPostDetailModal";
import { jobApplicationService } from "../../features/applyJob-employer/jobApplicationService";
import jobSeekerCvService from "../../features/jobSeekerCv/services";
import type { JobSeekerCv } from "../../features/jobSeekerCv/types";
import { jobSeekerPostService } from "../../features/candidate/services";
import type { SaveCandidateDto } from "../../features/candidate/type";
import type { ApplicationSummaryDto } from "../../features/applyJob-jobSeeker/type";
import { formatSalaryText } from "../../utils/jobPostHelpers";
import { getRepresentativeSalaryValue } from "../../utils/salary";
import type { SorterResult } from "antd/es/table/interface";

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

const getApiMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } }).response?.data?.message;

const EmployerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useCategories();

  const { categories, status: categoryStatus } = useSelector(
    (state: RootState) => state.category
  );

  const [allJobs, setAllJobs] = useState<JobPostView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);

  const [isSuggestionModalVisible, setIsSuggestionModalVisible] =
    useState(false);
  const [suggestionList, setSuggestionList] = useState<JobSuggestionDto[]>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isResettingSuggestions, setIsResettingSuggestions] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [savingCandidateIds, setSavingCandidateIds] = useState<number[]>([]);
  const [applicationSummary, setApplicationSummary] =
    useState<ApplicationSummaryDto | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [statusActionLoadingId, setStatusActionLoadingId] = useState<
    number | null
  >(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sortInfo, setSortInfo] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({
    field: "createdAt",
    order: "desc",
  });

    const fetchJobs = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await jobPostService.getJobsByUser(user.id);
      if (res.success) {
        setAllJobs(res.data);
      } else {
        message.error("Kh?ng th? t?i danh s?ch c?ng vi?c.");
      }
    } catch (err) {
      const apiMessage = getApiMessage(err);
      message.error(apiMessage || "L?i khi t?i d? li?u.");
    }
    setIsLoading(false);
  }, [user]);

  const fetchApplicationSummary = useCallback(async () => {
    if (!user) return;
    setIsSummaryLoading(true);
    try {
      const res = await jobApplicationService.getApplicationSummary();
      if (res.success && res.data) {
        setApplicationSummary(res.data);
      }
    } catch {
      message.error("Kh?ng th? t?i th?ng k? ?ng vi?n.");
    } finally {
      setIsSummaryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchJobs();
    void fetchApplicationSummary();
  }, [fetchJobs, fetchApplicationSummary]);

type ShortlistResponse = Awaited<
    ReturnType<typeof jobSeekerPostService.getShortlistedCandidates>
  >;

  const loadSuggestions = useCallback(async (postId: number) => {
    setIsSuggestionLoading(true);
    setSuggestionList([]);

  const [suggestionsRes, savedRes] = await Promise.allSettled([
      jobPostService.getSuggestions(postId),
      postId
        ? jobSeekerPostService.getShortlistedCandidates(postId)
        : Promise.resolve({ success: false } as ShortlistResponse),
  ]);

  let fetchedSuggestions: JobSuggestionDto[] = [];
  if (
    suggestionsRes.status === "fulfilled" &&
    suggestionsRes.value &&
    suggestionsRes.value.success &&
    Array.isArray(suggestionsRes.value.data)
  ) {
    fetchedSuggestions = suggestionsRes.value.data;
  }

  let savedSet = new Set<number>();
  if (
    savedRes.status === "fulfilled" &&
    savedRes.value &&
    savedRes.value.success
  ) {
    savedSet = new Set(savedRes.value.data.map((item) => item.jobSeekerId));
  }

    setSavedCandidateIds(savedSet);

    setSuggestionList(
      fetchedSuggestions.map((item) => ({
        ...item,
        isSaved:
          savedSet.has(item.seekerUserId ?? item.jobSeekerPostId ?? 0) ||
          Boolean(item.isSaved),
      }))
    );

    if (suggestionsRes.status === "rejected") {
      console.error("Lỗi tải gợi ý", suggestionsRes.reason);
      message.error("Không thể tải gợi ý AI.");
    }

    if (savedRes.status === "rejected") {
      console.error("Lỗi tải danh sách đã lưu", savedRes.reason);
    }

    setIsSuggestionLoading(false);
  }, []);

  const handleShowSuggestions = (postId: number, jobTitle: string) => {
    setCurrentJobTitle(jobTitle);
    setCurrentJobId(postId);
    setIsSuggestionModalVisible(true);
    loadSuggestions(postId);
  };

  const handleResetAiSuggestions = async () => {
    if (!currentJobId) return;
    setIsResettingSuggestions(true);
    try {
      const res = (await jobPostService.refreshAiSuggestions(currentJobId)) as {
        success?: boolean;
        message?: string;
      };
      if (res?.success) {
        message.success("Đã làm mới gợi ý AI.");
      } else {
        message.info(res?.message || "Đã gửi yêu cầu làm mới gợi ý AI.");
      }
      await loadSuggestions(currentJobId);
    } catch (error) {
      message.error(
        getApiMessage(error) || "Không thể gửi yêu cầu làm mới gợi ý AI."
      );
    } finally {
      setIsResettingSuggestions(false);
    }
  };

  const [selectedSuggestedCandidate, setSelectedSuggestedCandidate] =
    useState<JobSuggestionDto | null>(null);
  const [cvModal, setCvModal] = useState<{
    visible: boolean;
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
  }>({
    visible: false,
    loading: false,
    cv: null,
    error: null,
  });

  const cvExtraFields = (cvModal.cv as (JobSeekerCv & { experience?: string; education?: string }) | null);
  const cvExperience = cvExtraFields?.experience;
  const cvEducation = cvExtraFields?.education;
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<number>>(
    new Set()
  );

  const handleViewSuggestedJobSeekerPost = (suggestion: JobSuggestionDto) => {
    setSelectedSuggestedCandidate(suggestion);
  };

  const getCvIdFromSuggestion = (suggestion?: JobSuggestionDto | null) => {
    return suggestion?.selectedCvId ?? suggestion?.cvId ?? null;
  };

  const getSeekerId = (suggestion: JobSuggestionDto) =>
    suggestion.seekerUserId ?? suggestion.jobSeekerPostId ?? null;

  const isSuggestionSaved = (suggestion: JobSuggestionDto) => {
    const seekerId = getSeekerId(suggestion);
    return seekerId ? savedCandidateIds.has(seekerId) : suggestion.isSaved ?? false;
  };

  const selectedCvId = getCvIdFromSuggestion(selectedSuggestedCandidate);

  const handleViewCandidateCv = async () => {
    const cvId = getCvIdFromSuggestion(selectedSuggestedCandidate);
    if (!cvId) {
      message.info("Ứng viên này chưa đính kèm CV.");
      return;
    }
    setCvModal({ visible: true, loading: true, cv: null, error: null });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(cvId);
      setCvModal({ visible: true, loading: false, cv, error: null });
    } catch {
      setCvModal({
        visible: true,
        loading: false,
        cv: null,
        error: "Không thể tải CV. Vui lòng thử lại.",
      });
    }
  };

  const getCandidateKey = useCallback(
    (suggestion: JobSuggestionDto) =>
      suggestion.jobSeekerPostId ?? suggestion.seekerUserId ?? suggestion.employerPostId,
    []
  );

  const handleToggleSaveCandidate = async (suggestion: JobSuggestionDto) => {
    if (!currentJobId) {
      message.error("Không xác định bài đăng để lưu ứng viên.");
      return;
    }

    if (!user) {
      message.error("Bạn cần đăng nhập để lưu ứng viên.");
      return;
    }

    const jobSeekerId = suggestion.seekerUserId;
    if (!jobSeekerId) {
      message.error("Ứng viên không xác định.");
      return;
    }

    const candidateKey = getCandidateKey(suggestion);
    if (savingCandidateIds.includes(candidateKey)) {
      return;
    }

    setSavingCandidateIds((prev) => [...prev, candidateKey]);

    const payload: SaveCandidateDto = {
      employerId: user.id,
      employerPostId: currentJobId,
      jobSeekerId,
    };

    try {
      if (suggestion.isSaved) {
        await jobSeekerPostService.unsaveCandidate(payload);
        message.success("Đã bỏ lưu ứng viên.");
      } else {
        await jobSeekerPostService.saveCandidate(payload);
        message.success("Đã lưu ứng viên.");
      }

      setSuggestionList((prev) =>
        prev.map((item) =>
          getCandidateKey(item) === candidateKey
            ? { ...item, isSaved: !item.isSaved }
            : item
        )
      );

      setSelectedSuggestedCandidate((prev) =>
        prev && getCandidateKey(prev) === candidateKey
          ? { ...prev, isSaved: !prev.isSaved }
          : prev
      );
      setSavedCandidateIds((prev) => {
        const copy = new Set(prev);
        if (copy.has(jobSeekerId)) copy.delete(jobSeekerId);
        else copy.add(jobSeekerId);
        return copy;
      });
    } catch (error) {
      message.error(
        getApiMessage(error) || "Không thể cập nhật trạng thái lưu ứng viên."
      );
    } finally {
      setSavingCandidateIds((prev) =>
        prev.filter((id) => id !== candidateKey)
      );
    }
  };

  const handleSaveButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    suggestion: JobSuggestionDto
  ) => {
    event.preventDefault();
    event.stopPropagation();
    handleToggleSaveCandidate(suggestion);
  };


  const handleCloseSuggestionModal = () => {
    setIsSuggestionModalVisible(false);
    setCurrentJobId(null);
    setSelectedSuggestedCandidate(null);
  };

  const processedJobs = useMemo(() => {
    let filteredData = [...allJobs];

    if (searchTerm) {
      filteredData = filteredData.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredData = filteredData.filter((job) => {
        const jobCategoryId =
          job.categoryId ?? (job as { categoryID?: number | null }).categoryID ?? null;
        return jobCategoryId === selectedCategory;
      });
    }

    const { field, order } = sortInfo;
    if (field && order) {
      filteredData.sort((a, b) => {
        const resolveValue = (job: JobPostView) => {
          if (field === "salaryDisplay") {
            return (
              getRepresentativeSalaryValue(job.salaryMin, job.salaryMax) ?? -1
            );
          }
          return job[field as keyof JobPostView] ?? "";
        };

        const valA = resolveValue(a);
        const valB = resolveValue(b);

        let compare = 0;
        if (valA > valB) compare = 1;
        if (valA < valB) compare = -1;

        return order === "asc" ? compare : -compare;
      });
    }

    return filteredData;
  }, [
    allJobs,
    searchTerm,
    selectedCategory,
    sortInfo
  ]);

  const paginatedJobs = useMemo(() => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return processedJobs.slice(startIndex, startIndex + pageSize);
  }, [processedJobs, pagination]);

  const handleRefresh = () => {
    fetchJobs();
  };

  const handleEdit = (id: number) => {
    navigate(`/nha-tuyen-dung/sua-tin/${id}`);
  };

  const handlePostStatusChange = async (
    postId: number,
    action: "close" | "reopen"
  ) => {
    if (statusActionLoadingId) return;
    setStatusActionLoadingId(postId);
    const nextStatus = action === "close" ? "Archived" : "Active";
    try {
      const response =
        action === "close"
          ? await jobPostService.closeEmployerPost(postId)
          : await jobPostService.reopenEmployerPost(postId);
      const fallbackMessage =
        action === "close"
          ? "Đã khóa tin tuyển dụng."
          : "Đã mở tin tuyển dụng.";
      message.success(response?.message || fallbackMessage);
      setAllJobs((prev) =>
        prev.map((job) =>
          job.employerPostId === postId ? { ...job, status: nextStatus } : job
        )
      );
    } catch (err) {
      message.error(
        getApiMessage(err) ||
          "Cập nhật trạng thái tin tuyển dụng thất bại."
      );
    } finally {
      setStatusActionLoadingId(null);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa bài đăng này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xác nhận xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await jobPostService.deleteJobPost(id);
          if (res.success) {
            message.success(res.message);
            fetchJobs();
          } else {
            message.error(res.message);
          }
        } catch (err) {
      message.error(getApiMessage(err) || "Xóa thất bại.");
        }
      },
    });
  };

  const handleViewDetails = (id: number) => {
    const jobToView = allJobs.find((job) => job.employerPostId === id);
    if (jobToView) {
      setSelectedJob(jobToView);
      setIsModalVisible(true);
    } else {
      message.error("Không tìm thấy chi tiết công việc.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedJob(null);
  };

  const handleTableChange: TableProps<JobPostView>["onChange"] = (
    newPagination,
    _filters,
    sorter: SorterResult<JobPostView> | SorterResult<JobPostView>[]
  ) => {
    const normalizedSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });

    setSortInfo({
      field: (normalizedSorter?.field as string) || "createdAt",
      order: normalizedSorter?.order
        ? normalizedSorter.order === "ascend"
          ? "asc"
          : "desc"
        : "desc",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns: TableColumnsType<JobPostView> = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      sorter: true,
      render: (status: string) => {
        const normalized = (status || "").toLowerCase();
        if (normalized === "draft") {
          return (
             <Tag color="default" style={{ fontSize: 12, padding: "2px 8px" }}>
               Bản nháp
            </Tag>
          );
        }
        if (normalized === "active") {
          return (
             <Tag color="green" style={{ fontSize: 12, padding: "2px 8px" }}>
               Đang đăng
            </Tag>
          );
        }
        if (normalized === "archived") {
          return (
             <Tag color="orange" style={{ fontSize: 12, padding: "2px 8px" }}>
               Đã khóa
            </Tag>
          );
        }
        if (normalized === "expired") {
          return (
            <Tag color="red" style={{ fontSize: 12, padding: "2px 8px" }}>
              Hết hạn
            </Tag>
          );
        }
        return (
             <Tag style={{ fontSize: 12, padding: "2px 8px" }}>
             {status || "Khác"}
          </Tag>
        );
      },
    },
    {
      title: "Công việc",
      dataIndex: "title",
      key: "title",
      width: "32%",
      sorter: true,
      ellipsis: true,
      render: (text, record) => (
        <div className="max-w-full">
          <a
            onClick={() => handleViewDetails(record.employerPostId)}
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {text}
          </a>
          <div className="text-xs text-gray-500 truncate">
            {record.location || "(Chưa có địa điểm)"}
          </div>
          <div className="text-xs text-gray-500">
            Cập nhật: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      width: "18%",
      sorter: true,
      ellipsis: true,
      render: (category) => (
        <div>
          <Space>
            <AppstoreOutlined /> {category || "N/A"}
          </Space>
        </div>
      ),
    },
    {
      title: "Mức lương",
      dataIndex: "salaryDisplay",
      key: "salaryDisplay",
      width: "15%",
      sorter: true,
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <MoneyCollectOutlined />
          {formatSalaryText(
            record.salaryMin,
            record.salaryMax,
            record.salaryType,
            record.salaryDisplay
          )}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: "23%",
      render: (_, record) => (
        <Space size="small" style={{ display: "flex" }}>
          <Tooltip title="Gợi ý ứng viên">
            <Button
              icon={<BulbOutlined />}
              size="small"
              style={{
                backgroundColor: "#fffbe6",
                borderColor: "#fadb14",
                color: "#ad8b00",
              }}
              onClick={() =>
                handleShowSuggestions(record.employerPostId, record.title)
              }
            >
              Gợi ý
            </Button>
          </Tooltip>
          <Tooltip title="Ứng viên & đã lưu">
            <Button
              icon={<UsergroupAddOutlined />}
              size="small"
              style={{
                backgroundColor: "#f6ffed",
                borderColor: "#b7eb8f",
                color: "#389e0d",
              }}
              onClick={() =>
                navigate(`/nha-tuyen-dung/ung-vien/${record.employerPostId}`)
              }
            >
              Ứng viên
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa bài đăng">
            <Button
              icon={<EditOutlined />}
              size="small"
              style={{
                backgroundColor: "#e6f4ff",
                borderColor: "#91caff",
                color: "#0958d9",
              }}
              onClick={() => handleEdit(record.employerPostId)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Sửa trạng thái bài đăng">
            <Dropdown
              trigger={["click"]}
              menu={{
                items: ((): MenuProps["items"] => {
                  const normalized = (record.status || "").toLowerCase();
                  const isArchived = normalized === "archived";
                  const isActive = normalized === "active";
                  const isUpdating =
                    statusActionLoadingId === record.employerPostId;
                  return [
                    {
                      key: "close",
                      label: "Khóa tin",
                      icon: <LockOutlined />,
                      disabled: isArchived || isUpdating,
                    },
                    {
                      key: "reopen",
                      label: "Mở tin",
                      icon: <UnlockOutlined />,
                      disabled: isActive || isUpdating,
                    },
                    {
                      key: "delete",
                      label: <span className="text-red-600">Xóa tin</span>,
                      icon: <DeleteOutlined style={{ color: "#dc2626" }} />,
                    },
                  ];
                })(),
                onClick: ({ key }) => {
                  if (key === "close" || key === "reopen") {
                    handlePostStatusChange(
                      record.employerPostId,
                      key as "close" | "reopen"
                    );
                  } else if (key === "delete") {
                    handleDelete(record.employerPostId);
                  }
                },
              }}
            >
              <Button
                type="default"
                size="small"
                icon={<MoreOutlined />}
                style={{
                  backgroundColor: "#fff1f0",
                  borderColor: "#ffccc7",
                  color: "#cf1322",
                }}
                loading={statusActionLoadingId === record.employerPostId}
              >
                 Khác
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg border-none rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 md:p-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">
              Quản lý bài tuyển dụng
            </p>
            <Typography.Title level={3} className="!text-white !mb-0">
              Bài tuyển dụng công việc của tôi ({allJobs.length})
            </Typography.Title>
            <p className="text-white/80 max-w-2xl">
              Theo dõi, lọc và cập nhật nhanh các tin tuyển dụng đang chạy. Đăng tin
              mới chỉ với một bước.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Làm mới
              </Button>
              <NavLink to="/nha-tuyen-dung/dang-tin">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="bg-emerald-400 border-none"
                >
                  Đăng bài tuyển dụng công việc mới
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/90 shadow-inner">
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-200" />
              <span>
                Đang hoạt động:{" "}
                <strong>
                  {
                    allJobs.filter(
                      (job) => (job.status || "").toLowerCase() === "active"
                    ).length
                  }
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <FileTextOutlined className="text-emerald-200" />
              <span>
                Ứng viên mới:{" "}
                <strong>
                  {isSummaryLoading
                    ? "..."
                    : applicationSummary?.pendingTotal ?? 0}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        {/* HÀNG FILTER DÀN ĐẦU 24 CỘT */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={10}>
            <Search
              placeholder="Tìm kiếm theo tiêu đề công việc..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              enterButton
              allowClear
              loading={isLoading}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} md={12} lg={7}>
            <Select
              placeholder="Lọc theo ngành nghề"
              onChange={handleCategoryChange}
              allowClear
              style={{ width: "100%" }}
              loading={categoryStatus === "loading"}
            >
              {categories.map((cat: Category) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          rowKey="employerPostId"
          columns={columns}
          dataSource={paginatedJobs}
          loading={isLoading}
          onChange={handleTableChange}
          tableLayout="fixed"
          className="w-full"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: processedJobs.length,
            showSizeChanger: true,
          }}
        />

        <JobPostDetailModal
          jobPost={selectedJob}
          visible={isModalVisible}
          onClose={handleCloseModal}
        />

        <Modal
          title={
            <div className="flex items-center gap-2">
              <BulbOutlined style={{ color: "#faad14", fontSize: "20px" }} />
              <div>
                <div className="font-bold">Gợi ý phù hợp</div>
                <div className="text-xs text-gray-500 font-normal">
                  Dành cho tin: {currentJobTitle}
                </div>
              </div>
            </div>
          }
          open={isSuggestionModalVisible}

          onCancel={handleCloseSuggestionModal}

          footer={[

            <Button

              key="reset"

              icon={<ReloadOutlined />}

              onClick={handleResetAiSuggestions}

              disabled={!currentJobId}

              loading={isResettingSuggestions}

            >

              Làm mới

            </Button>,

            <Button

              key="close"

              onClick={handleCloseSuggestionModal}

            >

              Đóng

            </Button>,

          ]}

          width={700}
          centered
        >
          {selectedSuggestedCandidate && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold text-blue-700">
                    {selectedSuggestedCandidate.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedSuggestedCandidate.preferredLocation ||
                      selectedSuggestedCandidate.location ||
                      "Địa điểm chưa có"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type={
                      isSuggestionSaved(selectedSuggestedCandidate)
                        ? "primary"
                        : "default"
                    }
                    size="small"
                    icon={
                      isSuggestionSaved(selectedSuggestedCandidate)
                        ? <HeartFilled />
                        : <HeartOutlined />
                    }
                    onClick={() => {
                      handleToggleSaveCandidate(selectedSuggestedCandidate);
                    }}
                  >
                    {isSuggestionSaved(selectedSuggestedCandidate)
                      ? "Đã lưu"
                      : "Lưu ứng viên"}
                  </Button>
                  {selectedCvId && (
                    <Button
                      type="default"
                      size="small"
                      icon={<FileTextOutlined />}
                      onClick={handleViewCandidateCv}
                    >
                      Xem CV
                    </Button>
                  )}
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setSelectedSuggestedCandidate(null)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {selectedSuggestedCandidate.description ||
                  "Không có mô tả chi tiết."}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Độ phù hợp:{" "}
                <strong>
                  {Math.round(
                    (selectedSuggestedCandidate.matchPercent ?? 0)
                  )}
                  %
                </strong>
              </div>
            </div>
          )}
          <List
            loading={isSuggestionLoading}
            itemLayout="vertical"
            dataSource={suggestionList}
            locale={{ emptyText: "Không có gợi ý phù hợp" }}
            renderItem={(item) => {
              const locationLabel =
                item.preferredLocation ||
                item.location ||
                "Chưa cập nhật địa điểm";

                  const candidateKey = getCandidateKey(item);
                  const isSaved = isSuggestionSaved(item);

              return (
                <List.Item
                  key={item.jobSeekerPostId ?? item.employerPostId ?? candidateKey}
                  className="hover:bg-gray-50 transition-colors border-b last:border-0 p-4"
                  extra={
                    <div className="flex flex-col items-center justify-center pl-4 border-l">
                      <Progress
                        type="circle"
                        percent={item.matchPercent}
                        width={60}
                        strokeColor={
                          item.matchPercent >= 80
                            ? "#52c41a"
                            : item.matchPercent >= 50
                            ? "#faad14"
                            : "#ff4d4f"
                        }
                        format={(percent) => (
                          <span className="text-sm font-bold">{percent}%</span>
                        )}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        Độ phù hợp
                      </span>
                    </div>
                  }
                  actions={[
                    <Tooltip
                      key="save-candidate"
                      title={item.isSaved ? "Bỏ lưu ứng viên" : "Lưu ứng viên"}
                    >
                      <Button
                        size="small"
                        type={isSaved ? "primary" : "default"}
                        icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                        onClick={(event) => handleSaveButtonClick(event, item)}
                        loading={savingCandidateIds.includes(candidateKey)}
                      >
                        {item.isSaved ? "Đã lưu" : "Lưu ứng viên"}
                      </Button>
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1890ff" }}
                      />
                    }
                    title={
                    <a
                      href="#"
                      className="text-base font-semibold text-blue-700 hover:underline"
                      onClick={(event) => {
                        event.preventDefault();
                        handleViewSuggestedJobSeekerPost(item);
                      }}
                    >
                      {item.title}
                    </a>
                    }
                    description={
                      <div className="space-y-1 mt-1">
                        <div className="flex items-start gap-2 text-gray-600 text-sm">
                          <EnvironmentOutlined className="mt-1 shrink-0" />
                          <span>{locationLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <PhoneOutlined />
                          <span>
                            Liên hệ:{" "}
                            <Text strong copyable>
                              {item.phoneContact || "N/A"}
                            </Text>
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Đăng bởi: {item.employerName}{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Modal>

        <Modal
          title={cvModal.cv?.cvTitle || "CV ứng viên"}
          open={cvModal.visible}
          footer={null}
          onCancel={() =>
            setCvModal({ visible: false, loading: false, cv: null, error: null })
          }
          width={680}
        >
          {cvModal.loading ? (
            <p>Đang tải CV...</p>
          ) : cvModal.error ? (
            <p className="text-red-500">{cvModal.error}</p>
          ) : cvModal.cv ? (
            <div className="space-y-4 text-sm">
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
                    <span className="font-semibold">Công việc mong muốn:</span>{" "}
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

              {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Kỹ năng
                  </h3>
                  {cvModal.cv.skillSummary && (
                    <p className="text-gray-700">{cvModal.cv.skillSummary}</p>
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

              {cvExperience && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Kinh nghiệm
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {cvExperience}
                  </p>
                </div>
              )}

              {cvEducation && (
                <div className="p-3 rounded-lg border bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-1">Học vấn</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {cvEducation}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 text-right">
                C?p nh?t:{" "}
                {cvModal.cv.updatedAt
                  ? new Date(cvModal.cv.updatedAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </div>
            </div>
          ) : (
            <p>Chưa có dữ liệu CV.</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default EmployerJobsPage;

