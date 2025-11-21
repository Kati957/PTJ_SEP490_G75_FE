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
  Modal,
  message
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import adminJobPostService from '../../features/admin/services/adminJobPost.service';
import type {
  AdminEmployerPost,
  AdminEmployerPostDetail,
  AdminJobSeekerPost,
  AdminJobSeekerPostDetail
} from '../../features/admin/types/jobPost';
import type { Category } from '../../features/category/type';
import { categoryService } from '../../features/category/service';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Option } = Select;

type DetailFieldProps = {
  label: string;
  value?: React.ReactNode;
  span?: 1 | 2;
};

const DetailField: React.FC<DetailFieldProps> = ({ label, value, span = 1 }) => (
  <div className={`flex flex-col gap-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="min-h-[42px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
      {value ?? <span className="text-gray-400 italic">Chưa cập nhật</span>}
    </div>
  </div>
);

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <Typography.Title level={5} className="!mb-1">
      {title}
    </Typography.Title>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  </section>
);

type EmployerStatusFilter = 'all' | 'Active' | 'Blocked' | 'Deleted';
type JobSeekerStatusFilter = 'all' | 'Active' | 'Archived';

interface EmployerFilters {
  keyword: string;
  status: EmployerStatusFilter;
  categoryId?: number;
}

interface JobSeekerFilters {
  keyword: string;
  status: JobSeekerStatusFilter;
  categoryId?: number;
}

type DetailState =
  | { type: 'employer'; data: AdminEmployerPostDetail }
  | { type: 'jobseeker'; data: AdminJobSeekerPostDetail };

type ActionContext =
  | { type: 'employer'; post: AdminEmployerPost }
  | { type: 'jobseeker'; post: AdminJobSeekerPost };

const AdminJobPostManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employer' | 'jobseeker'>('employer');

  const [employerPosts, setEmployerPosts] = useState<AdminEmployerPost[]>([]);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [employerFilters, setEmployerFilters] = useState<EmployerFilters>({
    keyword: '',
    status: 'all'
  });
  const [employerPagination, setEmployerPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });

  const [jobSeekerPosts, setJobSeekerPosts] = useState<AdminJobSeekerPost[]>([]);
  const [jobSeekerLoading, setJobSeekerLoading] = useState(false);
  const [jobSeekerFilters, setJobSeekerFilters] = useState<JobSeekerFilters>({
    keyword: '',
    status: 'all'
  });
  const [jobSeekerPagination, setJobSeekerPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailState, setDetailState] = useState<DetailState | null>(null);

  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);
  const [toggleType, setToggleType] = useState<'employer' | 'jobseeker' | null>(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonSubmitting, setReasonSubmitting] = useState(false);
  const [reasonValue, setReasonValue] = useState('');
  const [actionContext, setActionContext] = useState<ActionContext | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const resetReasonModal = () => {
    setReasonModalOpen(false);
    setActionContext(null);
    setReasonValue('');
  };

  const handleReasonCancel = () => {
    if (reasonSubmitting) return;
    resetReasonModal();
  };

  const handleReasonConfirm = async () => {
    if (!actionContext) return;
    setReasonSubmitting(true);
    try {
      const note = reasonValue.trim() || undefined;
      if (actionContext.type === 'employer') {
        await handleToggleEmployerPost(actionContext.post, note);
      } else {
        await handleToggleJobSeekerPost(actionContext.post, note);
      }
      resetReasonModal();
    } finally {
      setReasonSubmitting(false);
    }
  };
  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : undefined;
  const formatCurrency = (value?: number | null) =>
    value !== null && value !== undefined
      ? `${value.toLocaleString('vi-VN')} VND`
      : undefined;
  const formatLocation = (
    province?: string | null,
    district?: string | null,
    ward?: string | null
  ) => {
    const parts = [ward, district, province].filter(
      (part): part is string => Boolean(part && part.trim())
    );
    return parts.length ? parts.join(', ') : undefined;
  };

  const employerFilterParams = useMemo(
    () => ({
      status: employerFilters.status !== 'all' ? employerFilters.status : undefined,
      keyword: employerFilters.keyword.trim() || undefined,
      categoryId: employerFilters.categoryId ?? undefined
    }),
    [employerFilters]
  );

  const jobSeekerFilterParams = useMemo(
    () => ({
      status: jobSeekerFilters.status !== 'all' ? jobSeekerFilters.status : undefined,
      keyword: jobSeekerFilters.keyword.trim() || undefined,
      categoryId: jobSeekerFilters.categoryId ?? undefined
    }),
    [jobSeekerFilters]
  );

  const currentActionVerb = actionContext
    ? actionContext.type === 'employer'
      ? actionContext.post.status === 'Blocked'
        ? 'mở khóa'
        : 'khóa'
      : actionContext.post.status === 'Archived'
        ? 'mở khóa'
        : 'khóa'
    : '';

  const currentSubjectLabel = actionContext
    ? actionContext.type === 'employer'
      ? 'bài đăng nhà tuyển dụng'
      : 'bài đăng ứng viên'
    : 'bài đăng';

  const fetchEmployerPosts = useCallback(
    async (page = employerPagination.current ?? 1, pageSize = employerPagination.pageSize ?? 10) => {
      setEmployerLoading(true);
      try {
        const response = await adminJobPostService.getEmployerPosts({
          ...employerFilterParams,
          page,
          pageSize
        });
        setEmployerPosts(response.items);
        setEmployerPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch employer posts', error);
        message.error('Không thể tải danh sách bài đăng nhà tuyển dụng');
      } finally {
        setEmployerLoading(false);
      }
    },
    [employerFilterParams, employerPagination.current, employerPagination.pageSize]
  );

  const fetchJobSeekerPosts = useCallback(
    async (
      page = jobSeekerPagination.current ?? 1,
      pageSize = jobSeekerPagination.pageSize ?? 10
    ) => {
      setJobSeekerLoading(true);
      try {
        const response = await adminJobPostService.getJobSeekerPosts({
          ...jobSeekerFilterParams,
          page,
          pageSize
        });
        setJobSeekerPosts(response.items);
        setJobSeekerPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch job seeker posts', error);
        message.error('Không thể tải danh sách bài đăng ứng viên');
      } finally {
        setJobSeekerLoading(false);
      }
    },
    [jobSeekerFilterParams, jobSeekerPagination.current, jobSeekerPagination.pageSize]
  );

  useEffect(() => {
    void fetchEmployerPosts();
  }, [fetchEmployerPosts]);

  useEffect(() => {
    void fetchJobSeekerPosts();
  }, [fetchJobSeekerPosts]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
        message.error('Không thể tải danh sách ngành nghề');
      } finally {
        setCategoryLoading(false);
      }
    };
    void loadCategories();
  }, []);

  const handleEmployerFilterChange = (key: keyof EmployerFilters, value: string | number | null) => {
    setEmployerFilters((prev) => ({
      ...prev,
      [key]: typeof value === 'number' && Number.isNaN(value) ? undefined : value ?? undefined
    }));
    setEmployerPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleJobSeekerFilterChange = (
    key: keyof JobSeekerFilters,
    value: string | number | null
  ) => {
    setJobSeekerFilters((prev) => ({
      ...prev,
      [key]: typeof value === 'number' && Number.isNaN(value) ? undefined : value ?? undefined
    }));
    setJobSeekerPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleEmployerTableChange = (pagination: TablePaginationConfig) => {
    setEmployerPagination(pagination);
    void fetchEmployerPosts(pagination.current, pagination.pageSize);
  };

  const handleJobSeekerTableChange = (pagination: TablePaginationConfig) => {
    setJobSeekerPagination(pagination);
    void fetchJobSeekerPosts(pagination.current, pagination.pageSize);
  };

  const openDetail = async (type: 'employer' | 'jobseeker', id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      if (type === 'employer') {
        const detail = await adminJobPostService.getEmployerPostDetail(id);
        setDetailState({ type, data: detail });
      } else {
        const detail = await adminJobPostService.getJobSeekerPostDetail(id);
        setDetailState({ type, data: detail });
      }
    } catch (error) {
      console.error('Failed to load post detail', error);
      message.error('Không thể tải chi tiết bài đăng');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleEmployerPost = async (post: AdminEmployerPost, reason?: string) => {
    setToggleLoadingId(post.employerPostId);
    setToggleType('employer');
    try {
      await adminJobPostService.toggleEmployerPostBlocked(post.employerPostId, reason);
      message.success(
        post.status === 'Blocked'
          ? 'Đã mở khóa bài đăng nhà tuyển dụng'
          : 'Đã khóa bài đăng nhà tuyển dụng'
      );
      await fetchEmployerPosts();
    } catch (error) {
      console.error('Failed to toggle employer post', error);
      message.error('Không thể thay đổi trạng thái bài đăng');
    } finally {
      setToggleLoadingId(null);
      setToggleType(null);
    }
  };

  const handleToggleJobSeekerPost = async (post: AdminJobSeekerPost, reason?: string) => {
    setToggleLoadingId(post.jobSeekerPostId);
    setToggleType('jobseeker');
    try {
      await adminJobPostService.toggleJobSeekerPostArchived(post.jobSeekerPostId, reason);
      message.success(
        post.status === 'Archived'
          ? 'Đã mở khóa bài đăng ứng viên'
          : 'Đã khóa bài đăng ứng viên'
      );
      await fetchJobSeekerPosts();
    } catch (error) {
      console.error('Failed to toggle job seeker post', error);
      message.error('Không thể thay đổi trạng thái bài đăng');
    } finally {
      setToggleLoadingId(null);
      setToggleType(null);
    }
  };

  const employerColumns: ColumnsType<AdminEmployerPost> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-xs text-gray-500">{record.employerEmail}</span>
          {record.employerName && <span className="text-xs text-gray-500">{record.employerName}</span>}
        </Space>
      )
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (value?: string | null) => value ?? 'Chưa xác định'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: string) => (
        <Tag color={value === 'Blocked' ? 'red' : 'green'}>
          {value === 'Blocked' ? 'Đã khóa' : value === 'Deleted' ? 'Đã xóa' : 'Đang hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail('employer', record.employerPostId)}>
            Xem
          </Button>
          <Button
            icon={record.status === 'Blocked' ? <CheckCircleOutlined /> : <StopOutlined />}
            size="small"
            type={record.status === 'Blocked' ? 'primary' : 'default'}
            danger={record.status !== 'Blocked'}
            loading={toggleType === 'employer' && toggleLoadingId === record.employerPostId}
            onClick={() => {
              setActionContext({ type: 'employer', post: record });
              setReasonValue('');
              setReasonModalOpen(true);
            }}
          >
            {record.status === 'Blocked' ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Space>
      )
    }
  ];

  const jobSeekerColumns: ColumnsType<AdminJobSeekerPost> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-xs text-gray-500">{record.jobSeekerEmail}</span>
          {record.fullName && <span className="text-xs text-gray-500">{record.fullName}</span>}
        </Space>
      )
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (value?: string | null) => value ?? 'Chưa xác định'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: string) => (
        <Tag color={value === 'Archived' ? 'orange' : 'green'}>
          {value === 'Archived' ? 'Đã khóa' : 'Đang hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail('jobseeker', record.jobSeekerPostId)}>
            Xem
          </Button>
          <Button
            icon={record.status === 'Archived' ? <CheckCircleOutlined /> : <StopOutlined />}
            size="small"
            type={record.status === 'Archived' ? 'primary' : 'default'}
            danger={record.status !== 'Archived'}
            loading={toggleType === 'jobseeker' && toggleLoadingId === record.jobSeekerPostId}
            onClick={() => {
              setActionContext({ type: 'jobseeker', post: record });
              setReasonValue('');
              setReasonModalOpen(true);
            }}
          >
            {record.status === 'Archived' ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Space>
      )
    }
  ];

  const renderEmployerTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tiêu đề, mô tả, email..."
            allowClear
            value={employerFilters.keyword}
            onChange={(event) => handleEmployerFilterChange('keyword', event.target.value)}
          />
          <Space wrap size="middle">
            <Select
              value={employerFilters.status}
              onChange={(value: EmployerStatusFilter) => handleEmployerFilterChange('status', value)}
              style={{ width: 220 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Active">Đang hoạt động</Option>
              <Option value="Blocked">Đã khóa</Option>
              <Option value="Deleted">Đã xóa</Option>
            </Select>
            <Select
              allowClear
              showSearch
              placeholder="Chọn ngành nghề"
              value={employerFilters.categoryId}
              loading={categoryLoading}
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              onChange={(value) => handleEmployerFilterChange('categoryId', value ?? null)}
            >
              {categories.map((category) => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="employerPostId"
          loading={employerLoading}
          columns={employerColumns}
          dataSource={employerPosts}
          pagination={employerPagination}
          scroll={{ x: 1000 }}
          onChange={handleEmployerTableChange}
        />
      </Card>
    </>
  );

  const renderJobSeekerTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tiêu đề, mô tả, email..."
            allowClear
            value={jobSeekerFilters.keyword}
            onChange={(event) => handleJobSeekerFilterChange('keyword', event.target.value)}
          />
          <Space wrap size="middle">
            <Select
              value={jobSeekerFilters.status}
              onChange={(value: JobSeekerStatusFilter) =>
                handleJobSeekerFilterChange('status', value)
              }
              style={{ width: 220 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Active">Đang hoạt động</Option>
              <Option value="Archived">Đã khóa</Option>
            </Select>
            <Select
              allowClear
              showSearch
              placeholder="Chọn ngành nghề"
              value={jobSeekerFilters.categoryId}
              loading={categoryLoading}
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              onChange={(value) => handleJobSeekerFilterChange('categoryId', value ?? null)}
            >
              {categories.map((category) => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="jobSeekerPostId"
          loading={jobSeekerLoading}
          columns={jobSeekerColumns}
          dataSource={jobSeekerPosts}
          pagination={jobSeekerPagination}
          scroll={{ x: 1000 }}
          onChange={handleJobSeekerTableChange}
        />
      </Card>
    </>
  );

  return (
    <>
      <AdminSectionHeader
        title="Quản lý bài đăng"
        description="Theo dõi bài đăng của nhà tuyển dụng và ứng viên, xử lý vi phạm nhanh chóng."
        gradient="from-violet-600 via-purple-500 to-pink-500"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => (activeTab === 'employer' ? fetchEmployerPosts() : fetchJobSeekerPosts())}
          >
            Tải lại
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'employer' | 'jobseeker')}
        items={[
          {
            key: 'employer',
            label: 'Bài đăng nhà tuyển dụng',
            children: renderEmployerTab()
          },
          {
            key: 'jobseeker',
            label: 'Bài đăng ứng viên',
            children: renderJobSeekerTab()
          }
        ]}
      />

      <Drawer
        title="Chi tiết bài đăng"
        placement="right"
        width={720}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailState(null);
        }}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : detailState ? (
          <div className="space-y-6">
            <DetailSection title="Thông tin chung">
              <DetailField
                label="Loại bài đăng"
                value={detailState.type === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
              />
              <DetailField label="Tiêu đề" value={detailState.data.title} span={2} />
              <DetailField label="Chuyên mục" value={detailState.data.categoryName || undefined} />
            </DetailSection>

            <DetailSection title="Trạng thái & thời gian">
              <DetailField label="Trạng thái" value={detailState.data.status} />
              <DetailField label="Tạo lúc" value={formatDateTime(detailState.data.createdAt)} />
            </DetailSection>

            {detailState.type === 'employer' ? (
              <>
                <DetailSection title="Thông tin công việc">
                  <DetailField
                    label="Lương"
                    value={formatCurrency(detailState.data.salary)}
                  />
                  <DetailField
                    label="Giờ làm việc"
                    value={detailState.data.workHours || undefined}
                  />
                  <DetailField
                    label="Địa điểm"
                    value={formatLocation(
                      detailState.data.provinceName,
                      detailState.data.districtName,
                      detailState.data.wardName
                    )}
                  />
                  <DetailField
                    label="Mô tả công việc"
                    value={
                      detailState.data.description ? (
                        <div className="whitespace-pre-line leading-relaxed">
                          {detailState.data.description}
                        </div>
                      ) : undefined
                    }
                    span={2}
                  />
                  <DetailField
                    label="Yêu cầu"
                    value={
                      detailState.data.requirements ? (
                        <div className="whitespace-pre-line leading-relaxed">
                          {detailState.data.requirements}
                        </div>
                      ) : undefined
                    }
                    span={2}
                  />
                </DetailSection>

                <DetailSection title="Thông tin liên hệ">
                  <DetailField
                    label="Nhà tuyển dụng"
                    value={detailState.data.employerName || undefined}
                  />
                  <DetailField
                    label="Email liên hệ"
                    value={detailState.data.employerEmail || undefined}
                  />
                  <DetailField
                    label="Số điện thoại"
                    value={detailState.data.phoneContact || undefined}
                  />
                </DetailSection>
              </>
            ) : (
              <>
                <DetailSection title="Hồ sơ ứng viên">
                  <DetailField
                    label="Họ tên"
                    value={detailState.data.fullName || undefined}
                  />
                  <DetailField
                    label="Email"
                    value={detailState.data.jobSeekerEmail || undefined}
                  />
                  <DetailField
                    label="Giới tính"
                    value={detailState.data.gender || undefined}
                  />
                  <DetailField
                    label="Khu vực"
                    value={formatLocation(
                      detailState.data.provinceName,
                      detailState.data.districtName,
                      detailState.data.wardName
                    )}
                  />
                  <DetailField
                    label="Giờ làm mong muốn"
                    value={detailState.data.preferredWorkHours || undefined}
                  />
                </DetailSection>

                <DetailSection title="Mô tả">
                  <DetailField
                    label="Thông tin"
                    value={
                      detailState.data.description ? (
                        <div className="whitespace-pre-line leading-relaxed">
                          {detailState.data.description}
                        </div>
                      ) : undefined
                    }
                    span={2}
                  />
                </DetailSection>
              </>
            )}

            <DetailSection title="Trạng thái & thời gian">
              <DetailField label="Trạng thái" value={detailState.data.status} />
              <DetailField label="Tạo lúc" value={formatDateTime(detailState.data.createdAt)} />
            </DetailSection>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Modal
        title={
          actionContext
            ? `${actionContext.type === 'employer' ? 'Bài đăng nhà tuyển dụng' : 'Bài đăng ứng viên'} - ${
                actionContext.post.title
              }`
            : 'Nhập lý do'
        }
        open={reasonModalOpen}
        onCancel={handleReasonCancel}
        onOk={handleReasonConfirm}
        confirmLoading={reasonSubmitting}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Space direction="vertical" size="small" className="w-full">
          <Typography.Text>
            Vui lòng nhập lý do để {currentActionVerb || 'thực hiện'} {currentSubjectLabel}.
          </Typography.Text>
          <Input.TextArea
            rows={4}
            value={reasonValue}
            onChange={(event) => setReasonValue(event.target.value)}
            placeholder="Nhập lý do gửi tới người đăng bài (tùy chọn)"
            maxLength={500}
          />
          <Typography.Text type="secondary">
            Lý do này sẽ được gửi trong thông báo đến người dùng.
          </Typography.Text>
        </Space>
      </Modal>
    </>
  );
};

export default AdminJobPostManagementPage;
