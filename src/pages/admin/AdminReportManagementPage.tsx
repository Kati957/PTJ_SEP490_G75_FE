import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Space,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Drawer,
  Descriptions,
  Modal,
  Form,
  message
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import adminReportService from '../../features/admin/services/adminReport.service';
import adminSystemReportService from '../../features/admin/services/adminSystemReport.service';
import adminJobPostService from '../../features/admin/services/adminJobPost.service';
import { useNavigate } from 'react-router-dom';
import type {
  AdminReport,
  AdminReportDetail,
  AdminResolveReportPayload,
  AdminResolveSystemReportPayload,
  AdminSolvedReport,
  AdminSystemReport,
  AdminSystemReportDetail
} from '../../features/admin/types/report';
import type { AdminEmployerPostDetail, AdminJobSeekerPostDetail } from '../../features/admin/types/jobPost';
import AdminSectionHeader from './components/AdminSectionHeader';
import { formatSalaryText } from '../../utils/jobPostHelpers';

const { Text } = Typography;
const { Option } = Select;

const getApiMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } }).response?.data?.message;

interface PendingFilters {
  reportType: string;
  keyword: string;
}

interface SolvedFilters {
  reportType: string;
  adminEmail: string;
}

interface SystemFilters {
  status: string;
  keyword: string;
}

type SectionKey = 'posts' | 'system';
type PostTabKey = 'pending' | 'solved';

type ReportedPostDetail =
  | { kind: 'employer'; data: AdminEmployerPostDetail }
  | { kind: 'jobseeker'; data: AdminJobSeekerPostDetail };

type DetailRecord =
  | { type: 'pending'; data: AdminReportDetail; postDetail?: ReportedPostDetail }
  | { type: 'solved'; data: AdminReportDetail; postDetail?: ReportedPostDetail }
  | { type: 'system'; data: AdminSystemReportDetail };

interface ResolveFormValues {
  actionTaken: 'BlockPost' | 'HidePost' | 'Warn' | 'Ignore';
  reason?: string;
}

type ResolveSystemFormValues = AdminResolveSystemReportPayload;

type ResolveAction = ResolveFormValues['actionTaken'];

const AdminReportManagementPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('posts');
  const [postTab, setPostTab] = useState<PostTabKey>('pending');
  const navigate = useNavigate();

  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [pendingReports, setPendingReports] = useState<AdminReport[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<PendingFilters>({
    reportType: 'all',
    keyword: ''
  });
  const [pendingPagination, setPendingPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });

  const [solvedReports, setSolvedReports] = useState<AdminSolvedReport[]>([]);
  const [solvedLoading, setSolvedLoading] = useState(false);
  const [solvedFilters, setSolvedFilters] = useState<SolvedFilters>({
    reportType: 'all',
    adminEmail: ''
  });
  const [solvedPagination, setSolvedPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });

  const [systemReports, setSystemReports] = useState<AdminSystemReport[]>([]);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemFilters, setSystemFilters] = useState<SystemFilters>({
    status: 'all',
    keyword: ''
  });
  const [systemPagination, setSystemPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DetailRecord | null>(null);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<number | null>(null);
  const [resolvingReport, setResolvingReport] = useState<AdminReport | null>(null);
  const [resolveForm] = Form.useForm<ResolveFormValues>();

  const [systemResolveModalOpen, setSystemResolveModalOpen] = useState(false);
  const [systemResolveSubmitting, setSystemResolveSubmitting] = useState(false);
  const [resolvingSystemId, setResolvingSystemId] = useState<number | null>(null);
  const [systemResolveForm] = Form.useForm<ResolveSystemFormValues>();

  const addReportTypes = useCallback((types: Array<string | null | undefined>) => {
    setReportTypes((prev) => {
      const unique = new Set(prev);
      types.forEach((type) => {
        if (type) unique.add(type);
      });
      return Array.from(unique);
    });
  }, []);

  const normalizeText = useCallback(
    (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase(),
    []
  );

  const pendingKeywordNorm = useMemo(
    () => normalizeText(pendingFilters.keyword.trim() || ''),
    [pendingFilters.keyword, normalizeText]
  );

  const systemKeywordNorm = useMemo(
    () => normalizeText(systemFilters.keyword.trim() || ''),
    [systemFilters.keyword, normalizeText]
  );

  const pendingFilterParams = useMemo(
    () => ({
      reportType: pendingFilters.reportType !== 'all' ? pendingFilters.reportType : undefined,
      keyword: pendingFilters.keyword.trim() || undefined
    }),
    [pendingFilters]
  );

  const solvedFilterParams = useMemo(
    () => ({
      reportType: solvedFilters.reportType !== 'all' ? solvedFilters.reportType : undefined,
      adminEmail: solvedFilters.adminEmail.trim() || undefined
    }),
    [solvedFilters]
  );

const pendingPage = pendingPagination.current ?? 1;
const pendingPageSize = pendingPagination.pageSize ?? 10;
const solvedPage = solvedPagination.current ?? 1;
const solvedPageSize = solvedPagination.pageSize ?? 10;
const systemPage = systemPagination.current ?? 1;
const systemPageSize = systemPagination.pageSize ?? 10;

const systemFilterParams = useMemo(
    () => ({
      status: systemFilters.status !== 'all' ? systemFilters.status : undefined,
      keyword: systemFilters.keyword.trim() || undefined
    }),
    [systemFilters]
  );
  const sortedReportTypes = useMemo(() => [...reportTypes].sort(), [reportTypes]);

  const pendingDisplayed = useMemo(() => {
    if (!pendingKeywordNorm) return pendingReports;
    return pendingReports.filter((item) => {
      const haystack = normalizeText(
        `${item.reportType || ''} ${item.reporterEmail || ''} ${item.targetUserEmail || ''} ${item.reason || ''}`
      );
      return haystack.includes(pendingKeywordNorm);
    });
  }, [pendingKeywordNorm, pendingReports, normalizeText]);

  const systemDisplayed = useMemo(() => {
    if (!systemKeywordNorm) return systemReports;
    return systemReports.filter((item) => {
      const haystack = normalizeText(`${item.title || ''} ${item.userEmail || ''} ${item.description || ''}`);
      return haystack.includes(systemKeywordNorm);
    });
  }, [systemKeywordNorm, systemReports, normalizeText]);

  const fetchPendingReports = useCallback(
    async (page: number, pageSize: number) => {
      setPendingLoading(true);
      try {
        const response = await adminReportService.getPendingReports({
          ...pendingFilterParams,
          page,
          pageSize
        });
        setPendingReports(response.items);
        addReportTypes(response.items.map((item) => item.reportType));
        setPendingPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged =
            prev.current === next.current && prev.pageSize === next.pageSize && prev.total === next.total;
          return unchanged ? prev : next;
        });
      } catch (error) {
        console.error('Failed to fetch pending reports', error);
        message.error('Không thể tải danh sách report chờ xử lý');
      } finally {
        setPendingLoading(false);
      }
    },
    [addReportTypes, pendingFilterParams]
  );

  const fetchSolvedReports = useCallback(
    async (page: number, pageSize: number) => {
      setSolvedLoading(true);
      try {
        const response = await adminReportService.getSolvedReports({
          ...solvedFilterParams,
          page,
          pageSize
        });
        setSolvedReports(response.items);
        addReportTypes(response.items.map((item) => item.reportType).filter((v): v is string => Boolean(v)));
        setSolvedPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged =
            prev.current === next.current && prev.pageSize === next.pageSize && prev.total === next.total;
          return unchanged ? prev : next;
        });
      } catch (error) {
        console.error('Failed to fetch solved reports', error);
        message.error('Không thể tải danh sách report đã xử lý');
      } finally {
        setSolvedLoading(false);
      }
    },
    [addReportTypes, solvedFilterParams]
  );

  const fetchSystemReports = useCallback(
    async (page: number, pageSize: number) => {
      setSystemLoading(true);
      try {
        const response = await adminSystemReportService.getSystemReports({
          ...systemFilterParams,
          page,
          pageSize
        });
        setSystemReports(response.items);
        setSystemPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged =
            prev.current === next.current && prev.pageSize === next.pageSize && prev.total === next.total;
          return unchanged ? prev : next;
        });
      } catch (error) {
        console.error('Failed to fetch system reports', error);
        message.error('Không thể tải danh sách báo cáo hệ thống');
      } finally {
        setSystemLoading(false);
      }
    },
    [systemFilterParams]
  );

  useEffect(() => {
    void fetchPendingReports(pendingPage, pendingPageSize);
  }, [fetchPendingReports, pendingPage, pendingPageSize]);

  useEffect(() => {
    void fetchSolvedReports(solvedPage, solvedPageSize);
  }, [fetchSolvedReports, solvedPage, solvedPageSize]);

  useEffect(() => {
    void fetchSystemReports(systemPage, systemPageSize);
  }, [fetchSystemReports, systemPage, systemPageSize]);

  const handlePendingTableChange = (pagination: TablePaginationConfig) => {
    setPendingPagination(pagination);
  };

  const handleSolvedTableChange = (pagination: TablePaginationConfig) => {
    setSolvedPagination(pagination);
  };

  const handleSystemTableChange = (pagination: TablePaginationConfig) => {
    setSystemPagination(pagination);
  };

  const handlePendingFilterChange = (key: keyof PendingFilters, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    setPendingPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSolvedFilterChange = (key: keyof SolvedFilters, value: string) => {
    setSolvedFilters((prev) => ({ ...prev, [key]: value }));
    setSolvedPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSystemFilterChange = (key: keyof SystemFilters, value: string) => {
    setSystemFilters((prev) => ({ ...prev, [key]: value }));
    setSystemPagination((prev) => ({ ...prev, current: 1 }));
  };

  const buildManageLink = (type: 'employer' | 'jobseeker', id: number) => {
    const params = new URLSearchParams({ type, highlight: String(id) });
    return `/admin/job-posts?${params.toString()}`;
  };

  const fetchReportedPostDetail = async (
    detail: AdminReportDetail
  ): Promise<ReportedPostDetail | undefined> => {
    try {
      const normalizedType = (detail.postType || '').toLowerCase();
      const isEmployerPost =
        normalizedType.includes('employer') || (!!detail.employerPostId && normalizedType === '');
      const isJobSeekerPost =
        normalizedType.includes('jobseeker') || (!!detail.jobSeekerPostId && normalizedType === '');

      const employerPostId =
        detail.employerPostId ?? (isEmployerPost ? detail.postId ?? undefined : undefined);
      const jobSeekerPostId =
        detail.jobSeekerPostId ?? (isJobSeekerPost ? detail.postId ?? undefined : undefined);

      if (employerPostId) {
        const data = await adminJobPostService.getEmployerPostDetail(employerPostId);
        return { kind: 'employer', data };
      }
      if (jobSeekerPostId) {
        const data = await adminJobPostService.getJobSeekerPostDetail(jobSeekerPostId);
        return { kind: 'jobseeker', data };
      }
    } catch (error) {
      console.error('Failed to fetch reported post detail', error);
      message.warning('Không thể tải chi tiết bài đăng bị báo cáo');
    }
    return undefined;
  };

  const openDetail = async (id: number, type: DetailRecord['type']) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      if (type === 'system') {
        const detail = await adminSystemReportService.getSystemReportDetail(id);
        setDetailRecord({ type, data: detail });
      } else {
        const detail = await adminReportService.getReportDetail(id);
        const postDetail = await fetchReportedPostDetail(detail);
        setDetailRecord({ type, data: detail, postDetail });
      }
    } catch (error) {
      console.error('Failed to fetch detail', error);
      message.error('Không thể tải chi tiết report');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openResolveModal = (reportId: number) => {
    const reportContext = pendingReports.find((report) => report.reportId === reportId) ?? null;
    setResolvingReportId(reportId);
    setResolvingReport(reportContext);
    resolveForm.resetFields();
    const actions = resolveActionOptionsForType(reportContext?.reportType, reportContext?.postType);
    resolveForm.setFieldsValue({ actionTaken: actions[0] ?? 'Warn' });
    setResolveModalOpen(true);
  };

  const handleResolveReport = async (values: ResolveFormValues) => {
    if (resolvingReportId === null) return;
    setResolveSubmitting(true);
    try {
      const payload: AdminResolveReportPayload = {
        actionTaken: values.actionTaken,
        reason: values.reason?.trim() || undefined,
      };

      await adminReportService.resolveReport(resolvingReportId, payload);
      message.success('Đã xử lý report thành công');
      setResolveModalOpen(false);
      setResolvingReport(null);
      await Promise.all([
        fetchPendingReports(pendingPage, pendingPageSize),
        fetchSolvedReports(solvedPage, solvedPageSize)
      ]);
    } catch (error) {
      console.error('Failed to resolve report', error);
      const apiMessage: string | undefined = getApiMessage(error);
      message.error(apiMessage ?? 'Không thể xử lý report');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const openSystemResolveModal = (reportId: number) => {
    setResolvingSystemId(reportId);
    systemResolveForm.resetFields();
    systemResolveForm.setFieldsValue({ action: 'MarkSolved' });
    setSystemResolveModalOpen(true);
  };

  const openReportedPostFromList = async (reportId: number) => {
      try {
        const detail = await adminReportService.getReportDetail(reportId);
        const postDetail = await fetchReportedPostDetail(detail);
        if (!postDetail) {
          message.warning('Không tìm thấy bài đăng gắn với report này.');
        return;
      }
      const link =
        postDetail.kind === 'employer'
          ? buildManageLink('employer', postDetail.data.employerPostId)
          : buildManageLink('jobseeker', postDetail.data.jobSeekerPostId);
      navigate(link);
    } catch (error) {
      console.error('Failed to open reported post from list', error);
      message.error('Không thể mở bài đăng bị báo cáo');
    }
  };

  const handleResolveSystemReport = async () => {
    if (resolvingSystemId === null) return;
    setSystemResolveSubmitting(true);
    try {
      await adminSystemReportService.resolveSystemReport(resolvingSystemId);
      message.success('Đã cập nhật báo cáo hệ thống');
      setSystemResolveModalOpen(false);
      await fetchSystemReports(systemPage, systemPageSize);
    } catch (error) {
      console.error('Failed to resolve system report', error);
      message.error('Không thể cập nhật báo cáo hệ thống');
    } finally {
      setSystemResolveSubmitting(false);
    }
  };

  const reportTypeTag = (type: string) => {
    switch (type) {
      case 'EmployerPost':
        return <Tag color="purple">Bài đăng nhà tuyển dụng</Tag>;
      case 'JobSeekerPost':
        return <Tag color="blue">Bài đăng ứng viên</Tag>;
      case 'User':
        return <Tag color="gold">Người dùng</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const reportTypeLabel = (type: string) => {
    switch (type) {
      case 'EmployerPost':
        return 'Bài đăng nhà tuyển dụng';
      case 'JobSeekerPost':
        return 'Bài đăng ứng viên';
      case 'User':
        return 'Người dùng';
      default:
        return type;
    }
  };

  const statusTag = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="orange">
            Cho xử lý
          </Tag>
        );
      case 'Solved':
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Đã xử lý
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const formatCurrency = (
    min?: number | null,
    max?: number | null,
    type?: number | null,
    display?: string | null
  ) => formatSalaryText(min, max, type, display);

  const formatLocation = (province?: string | null, district?: string | null, ward?: string | null) => {
    const parts = [ward, district, province].filter((part): part is string => Boolean(part && part.trim()));
    return parts.length ? parts.join(', ') : undefined;
  };

  const postStatusTag = (status?: string | null) => {
    switch (status) {
      case 'Active':
        return <Tag color="green">Active</Tag>;
      case 'Blocked':
      case 'Deleted':
        return <Tag color="red">{status}</Tag>;
      case 'Archived':
        return <Tag color="orange">Archived</Tag>;
      default:
        return status ? <Tag>{status}</Tag> : '---';
    }
  };

  const formatDateTime = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '---';

  const resolveActionLabel = (action: string) => {
    switch (action) {
      case 'BlockPost':
        return 'Chặn bài đăng';
      case 'HidePost':
        return 'Ẩn bài đăng';
      case 'Warn':
        return 'Cảnh báo';
      case 'Ignore':
        return 'Bỏ qua';
      default:
        return action;
    }
  };

  const resolveActionOptionsForType = (
    reportType?: string | null,
    postType?: string | null
  ): ResolveAction[] => {
    const normalizedType = (reportType ?? '').toLowerCase();
    const normalizedPostType = (postType ?? '').toLowerCase();
    const isPostReport =
      normalizedType === 'employerpost' ||
      normalizedType === 'jobseekerpost' ||
      normalizedPostType === 'employerpost' ||
      normalizedPostType === 'jobseekerpost' ||
      normalizedType.includes('post') ||
      normalizedPostType.includes('post');
    return isPostReport ? ['BlockPost', 'Warn', 'Ignore'] : ['Warn', 'Ignore'];
  };

  const resolveActionOptions = useMemo(
    () => resolveActionOptionsForType(resolvingReport?.reportType, resolvingReport?.postType),
    [resolvingReport?.postType, resolvingReport?.reportType]
  );

  const resolveActionTag = (action: string) => {
    const color = action === 'BlockPost' ? 'red' : action === 'HidePost' ? 'volcano' : action === 'Warn' ? 'orange' : 'green';
    return <Tag color={color}>{resolveActionLabel(action)}</Tag>;
  };

  const pendingColumns: ColumnsType<AdminReport> = [
    {
      title: 'Loại',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (value: string) => reportTypeTag(value)
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterEmail',
      key: 'reporterEmail',
      width: 220
    },
    {
      title: 'Mục tiêu',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (value?: string | null) => (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220, display: 'inline-block' }}>
          {value ?? '---'}
        </Text>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'pending')}>
            Xem
          </Button>
          <Button icon={<ToolOutlined />} type="primary" size="small" onClick={() => openResolveModal(record.reportId)}>
            Xử lý
          </Button>
          <Button size="small" shape="round" onClick={() => openReportedPostFromList(record.reportId)}>
            Bài đăng
          </Button>
        </Space>
      )
    }
  ];

  const solvedColumns: ColumnsType<AdminSolvedReport> = [
    {
      title: 'Loại',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (_: string | undefined, record) =>
        record.reportType ? reportTypeTag(record.reportType) : '---'
    },
    {
      title: 'Hành động',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      render: (value: string) => resolveActionTag(value)
    },
    {
      title: 'Admin xử lý',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
      width: 220
    },
    {
      title: 'Người bị ảnh hưởng',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'Ngày xử lý',
      dataIndex: 'solvedAt',
      key: 'solvedAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'solved')}>
            Xem
          </Button>
          <Button size="small" shape="round" onClick={() => openReportedPostFromList(record.reportId)}>
            Bài đăng
          </Button>
        </Space>
      )
    }
  ];

  const systemColumns: ColumnsType<AdminSystemReport> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      render: (value: string) => (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220, display: 'inline-block' }}>
          {value}
        </Text>
      )
    },
    {
      title: 'Người gửi',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 220
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (value: string) => statusTag(value)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      render: (value?: string | null) => formatDateTime(value)
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'system')}>
            Xem
          </Button>
          {record.status !== 'Solved' && (
            <Button
              icon={<CheckCircleOutlined />}
              type="primary"
              size="small"
              onClick={() => openSystemResolveModal(record.reportId)}
            >
              Đánh dấu đã xử lý
            </Button>
          )}
        </Space>
      )
    }
  ];

  const renderReportedPostCard = (postDetail: ReportedPostDetail) => {
    if (postDetail.kind === 'employer') {
      const post = postDetail.data;
      const location = formatLocation(post.provinceName, post.districtName, post.wardName);
      const salary = formatCurrency(
        post.salaryMin,
        post.salaryMax,
        post.salaryType,
        post.salaryDisplay
      );
      return (
        <>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Loại bài đăng" span={2}>
              <Tag color="purple">Bài đăng nhà tuyển dụng</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mã bài đăng">#{post.employerPostId}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{postStatusTag(post.status)}</Descriptions.Item>
            <Descriptions.Item label="Tiêu đề" span={2}>
              {post.title}
            </Descriptions.Item>
            <Descriptions.Item label="Nhà tuyển dụng">{post.employerName ?? post.employerEmail}</Descriptions.Item>
            <Descriptions.Item label="Email">{post.employerEmail}</Descriptions.Item>
            {post.categoryName && <Descriptions.Item label="Ngành nghề">{post.categoryName}</Descriptions.Item>}
            <Descriptions.Item label="Ngày tạo">{formatDateTime(post.createdAt)}</Descriptions.Item>
            {salary && <Descriptions.Item label="Mức lương">{salary}</Descriptions.Item>}
            {post.workHours && <Descriptions.Item label="Giờ làm việc">{post.workHours}</Descriptions.Item>}
            {post.phoneContact && <Descriptions.Item label="Liên hệ">{post.phoneContact}</Descriptions.Item>}
            {location && <Descriptions.Item label="Địa điểm" span={2}>{location}</Descriptions.Item>}
            {post.description && (
              <Descriptions.Item label="Mô tả" span={2}>
                {post.description}
              </Descriptions.Item>
            )}
            {post.requirements && (
              <Descriptions.Item label="Yêu cầu" span={2}>
                {post.requirements}
              </Descriptions.Item>
            )}
          </Descriptions>
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.imageUrls.map((url: string) => (
                <div key={url} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <img src={url} alt="Ảnh bài đăng" className="w-full h-28 object-cover" />
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    const post = postDetail.data;
    const location = formatLocation(post.provinceName, post.districtName, post.wardName);
    return (
      <>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Loại bài đăng" span={2}>
            <Tag color="blue">Bài đăng ứng viên</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mã bài đăng">#{post.jobSeekerPostId}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{postStatusTag(post.status)}</Descriptions.Item>
          <Descriptions.Item label="Tiêu đề" span={2}>
            {post.title}
          </Descriptions.Item>
          <Descriptions.Item label="Người đăng">{post.fullName ?? post.jobSeekerEmail}</Descriptions.Item>
          <Descriptions.Item label="Email">{post.jobSeekerEmail}</Descriptions.Item>
          {post.categoryName && <Descriptions.Item label="Lĩnh vực">{post.categoryName}</Descriptions.Item>}
          <Descriptions.Item label="Ngày tạo">{formatDateTime(post.createdAt)}</Descriptions.Item>
          {post.preferredWorkHours && (
            <Descriptions.Item label="Thời gian mong muốn" span={2}>
              {post.preferredWorkHours}
            </Descriptions.Item>
          )}
          {post.gender && <Descriptions.Item label="Giới tính">{post.gender}</Descriptions.Item>}
          {location && <Descriptions.Item label="Địa điểm" span={2}>{location}</Descriptions.Item>}
          {post.description && (
            <Descriptions.Item label="Mô tả" span={2}>
              {post.description}
            </Descriptions.Item>
          )}
        </Descriptions>
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {post.imageUrls.map((url: string) => (
              <div key={url} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <img src={url} alt="Ảnh bài đăng" className="w-full h-28 object-cover" />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderPendingTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo email hoặc lý do..."
            allowClear
            value={pendingFilters.keyword}
            onChange={(event) => handlePendingFilterChange('keyword', event.target.value)}
          />
          <Select
            value={pendingFilters.reportType}
            onChange={(value) => handlePendingFilterChange('reportType', value)}
            style={{ width: 220 }}
          >
            <Option value="all">Tất cả loại report</Option>
            {sortedReportTypes.map((type) => (
              <Option key={type} value={type}>
                {reportTypeLabel(type)}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="reportId"
          loading={pendingLoading}
          columns={pendingColumns}
          dataSource={pendingDisplayed}
          pagination={pendingPagination}
          scroll={{ x: 1100 }}
          onChange={handlePendingTableChange}
        />
      </Card>
    </>
  );

  const renderSolvedTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Lọc theo email admin xử lý..."
            allowClear
            value={solvedFilters.adminEmail}
            onChange={(event) => handleSolvedFilterChange('adminEmail', event.target.value)}
          />
          <Select
            value={solvedFilters.reportType}
            onChange={(value) => handleSolvedFilterChange('reportType', value)}
            style={{ width: 220 }}
          >
            <Option value="all">Tat ca loai report</Option>
            {sortedReportTypes.map((type) => (
              <Option key={type} value={type}>
                {reportTypeLabel(type)}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="solvedReportId"
          loading={solvedLoading}
          columns={solvedColumns}
          dataSource={solvedReports}
          pagination={solvedPagination}
          scroll={{ x: 1100 }}
          onChange={handleSolvedTableChange}
        />
      </Card>
    </>
  );

  const renderSystemTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tiêu đề, mô tả hoặc email..."
            allowClear
            value={systemFilters.keyword}
            onChange={(event) => handleSystemFilterChange('keyword', event.target.value)}
          />
          <Select
            value={systemFilters.status}
            onChange={(value) => handleSystemFilterChange('status', value)}
            style={{ width: 220 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="Pending">Chờ xử lý</Option>
            <Option value="Solved">Dã xử lý</Option>
          </Select>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="reportId"
          loading={systemLoading}
          columns={systemColumns}
          dataSource={systemDisplayed}
          pagination={systemPagination}
          scroll={{ x: 1100 }}
          onChange={handleSystemTableChange}
        />
      </Card>
    </>
  );

  const renderPostSection = () => (
    <Tabs
      activeKey={postTab}
      onChange={(key) => setPostTab(key as PostTabKey)}
      items={[
        { key: 'pending', label: 'Report chờ xử lý', children: renderPendingTab() },
        { key: 'solved', label: 'Report đã xử lý', children: renderSolvedTab() }
      ]}
    />
  );

  const handleReload = () => {
    if (activeSection === 'system') {
      void fetchSystemReports(systemPagination.current ?? 1, systemPagination.pageSize ?? 10);
      return;
    }
    if (postTab === 'pending') {
      void fetchPendingReports(pendingPagination.current ?? 1, pendingPagination.pageSize ?? 10);
    } else {
      void fetchSolvedReports(solvedPagination.current ?? 1, solvedPagination.pageSize ?? 10);
    }
  };

  const renderDetailContent = () => {
    if (!detailRecord) {
      return <p>Không có dữ liệu.</p>;
    }

    if (detailRecord.type === 'system') {
      return (
        <Card bordered className="shadow-sm">
          <Descriptions column={1} bordered size="small" title="Thông tin báo cáo hệ thống">
            <Descriptions.Item label="Tiêu đề">{detailRecord.data.title}</Descriptions.Item>
            <Descriptions.Item label="Người gửi">{detailRecord.data.userEmail}</Descriptions.Item>
            {detailRecord.data.fullName && (
              <Descriptions.Item label="Tên hiển thị">{detailRecord.data.fullName}</Descriptions.Item>
            )}
            {detailRecord.data.description && (
              <Descriptions.Item label="Mô tả">{detailRecord.data.description}</Descriptions.Item>
            )}
            <Descriptions.Item label="Trạng thái">{statusTag(detailRecord.data.status)}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {detailRecord.data.updatedAt
                ? new Date(detailRecord.data.updatedAt).toLocaleString('vi-VN')
                : '---'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    return (
      <Space direction="vertical" size="middle" className="w-full">
        <Card bordered className="shadow-sm" title="Thông tin report">
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Loại report" span={2}>
              {reportTypeTag(detailRecord.data.reportType)}
            </Descriptions.Item>
            <Descriptions.Item label="Người báo cáo">{detailRecord.data.reporterEmail}</Descriptions.Item>
            {detailRecord.data.targetUserEmail && (
              <Descriptions.Item label="Người bị báo cáo">{detailRecord.data.targetUserEmail}</Descriptions.Item>
            )}
            {detailRecord.data.targetUserRole && (
              <Descriptions.Item label="Vai trò người bị báo cáo">
                {detailRecord.data.targetUserRole}
              </Descriptions.Item>
            )}
            {detailRecord.data.reason && <Descriptions.Item label="Lý do">{detailRecord.data.reason}</Descriptions.Item>}
            <Descriptions.Item label="Trạng thái">{detailRecord.data.status}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {detailRecord.data.postTitle && (
              <Descriptions.Item label="Tiêu đề bài đăng" span={2}>
                {detailRecord.data.postTitle}
              </Descriptions.Item>
            )}
            {detailRecord.data.employerPostTitle && (
              <Descriptions.Item label="Bài đăng nhà tuyển dụng" span={2}>
                {detailRecord.data.employerPostTitle}
              </Descriptions.Item>
            )}
            {detailRecord.data.jobSeekerPostTitle && (
              <Descriptions.Item label="Bài đăng ứng viên" span={2}>
                {detailRecord.data.jobSeekerPostTitle}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        {detailRecord.postDetail && (() => {
          const pd = detailRecord.postDetail;
          const manageLink =
            pd.kind === 'employer'
              ? buildManageLink('employer', pd.data.employerPostId)
              : buildManageLink('jobseeker', pd.data.jobSeekerPostId);
          return (
            <Card
              bordered
              className="shadow-sm"
              title="Bài đăng bị báo cáo"
              extra={
                <Button type="primary" size="small" onClick={() => navigate(manageLink)}>
                  Mở trang quản lý
                </Button>
              }
            >
              {renderReportedPostCard(pd)}
            </Card>
          );
        })()}
      </Space>
    );
  };

  return (
    <>
      <AdminSectionHeader
        title="Quản lý báo cáo hệ thống và bài đăng tuyển dụng"
        description="Gồm cả báo cáo bài đăng và báo cáo hệ thống để quản trị viên xử lý."
        gradient="from-rose-600 via-red-500 to-orange-500"
        extra={
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Tải lại
          </Button>
        }
      />

      <Tabs
        activeKey={activeSection}
        onChange={(key) => setActiveSection(key as SectionKey)}
        items={[
          { key: 'posts', label: 'Báo cáo bài đăng tìm vệc của người dùng', children: renderPostSection() },
          { key: 'system', label: 'Báo cáo hệ thống', children: renderSystemTab() }
        ]}
      />

      <Drawer
        title="Chi tiết report"
        placement="right"
        width={760}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? <p>Đang tải...</p> : renderDetailContent()}
      </Drawer>


      <Modal
        title="Xử lý report"
        open={resolveModalOpen}
        onCancel={() => {
          setResolvingReport(null);
          setResolveModalOpen(false);
        }}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveSubmitting}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveReport}>
          <Form.Item
            name="actionTaken"
            label="Hành động"
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select placeholder="Chọn cách xử lý">
              {resolveActionOptions.map((action) => (
                <Option key={action} value={action}>
                  {resolveActionLabel(action)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Lý do">
            <Input.TextArea rows={3} placeholder="Ghi chú xử lý (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xử lý báo cáo hệ thống"
        open={systemResolveModalOpen}
        onCancel={() => setSystemResolveModalOpen(false)}
        onOk={() => systemResolveForm.submit()}
        confirmLoading={systemResolveSubmitting}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={systemResolveForm} layout="vertical" onFinish={handleResolveSystemReport}>
          <Form.Item
            name="action"
            label="Hành động"
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select placeholder="Chọn cách xử lý">
              <Option value="MarkSolved">Đánh dấu đã xử lý</Option>
              <Option value="Ignore">Bỏ qua</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú gửi đến người dùng (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminReportManagementPage;
