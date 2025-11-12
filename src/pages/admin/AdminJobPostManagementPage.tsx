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
      {value ?? <span className="text-gray-400 italic">Chua cap nhat</span>}
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : undefined;
  const formatCurrency = (value?: number | null) =>
    value !== null && value !== undefined
      ? `${value.toLocaleString('vi-VN')} VND`
      : undefined;

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
        message.error('Khong the tai danh sach bai dang nha tuyen dung');
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
        message.error('Khong the tai danh sach bai dang ung vien');
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
        message.error('Khong the tai danh sach nganh nghe');
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
      message.error('Khong the tai chi tiet bai dang');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleEmployerPost = async (post: AdminEmployerPost) => {
    setToggleLoadingId(post.employerPostId);
    setToggleType('employer');
    try {
      await adminJobPostService.toggleEmployerPostBlocked(post.employerPostId);
      message.success(
        post.status === 'Blocked'
          ? 'Da mo khoa bai dang nha tuyen dung'
          : 'Da khoa bai dang nha tuyen dung'
      );
      await fetchEmployerPosts();
    } catch (error) {
      console.error('Failed to toggle employer post', error);
      message.error('Khong the thay doi trang thai bai dang');
    } finally {
      setToggleLoadingId(null);
      setToggleType(null);
    }
  };

  const handleToggleJobSeekerPost = async (post: AdminJobSeekerPost) => {
    setToggleLoadingId(post.jobSeekerPostId);
    setToggleType('jobseeker');
    try {
      await adminJobPostService.toggleJobSeekerPostArchived(post.jobSeekerPostId);
      message.success(
        post.status === 'Archived'
          ? 'Da kich hoat lai bai dang ung vien'
          : 'Da luu tru bai dang ung vien'
      );
      await fetchJobSeekerPosts();
    } catch (error) {
      console.error('Failed to toggle job seeker post', error);
      message.error('Khong the thay doi trang thai bai dang');
    } finally {
      setToggleLoadingId(null);
      setToggleType(null);
    }
  };

  const employerColumns: ColumnsType<AdminEmployerPost> = [
    {
      title: 'Tieu de',
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
      title: 'Chuyen muc',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (value?: string | null) => value ?? 'Chua xac dinh'
    },
    {
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: string) => (
        <Tag color={value === 'Blocked' ? 'red' : 'green'}>
          {value === 'Blocked' ? 'Da khoa' : value === 'Deleted' ? 'Da xoa' : 'Dang hoat dong'}
        </Tag>
      )
    },
    {
      title: 'Tao luc',
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
      title: 'Hanh dong',
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
            danger={record.status !== 'Blocked'}
            loading={toggleType === 'employer' && toggleLoadingId === record.employerPostId}
            onClick={() => handleToggleEmployerPost(record)}
          >
            {record.status === 'Blocked' ? 'Mo khoa' : 'Khoa'}
          </Button>
        </Space>
      )
    }
  ];

  const jobSeekerColumns: ColumnsType<AdminJobSeekerPost> = [
    {
      title: 'Tieu de',
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
      title: 'Chuyen muc',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (value?: string | null) => value ?? 'Chua xac dinh'
    },
    {
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: string) => (
        <Tag color={value === 'Archived' ? 'orange' : 'green'}>
          {value === 'Archived' ? 'Da luu tru' : 'Dang hoat dong'}
        </Tag>
      )
    },
    {
      title: 'Tao luc',
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
      title: 'Hanh dong',
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
            onClick={() => handleToggleJobSeekerPost(record)}
          >
            {record.status === 'Archived' ? 'Khoi phuc' : 'Luu tru'}
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
            placeholder="Tim theo tieu de, mo ta, email..."
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
              <Option value="all">Tat ca trang thai</Option>
              <Option value="Active">Dang hoat dong</Option>
              <Option value="Blocked">Da khoa</Option>
              <Option value="Deleted">Da xoa</Option>
            </Select>
            <Select
              allowClear
              showSearch
              placeholder="Chon nganh nghe"
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
            placeholder="Tim theo tieu de, mo ta, email..."
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
              <Option value="all">Tat ca trang thai</Option>
              <Option value="Active">Dang hoat dong</Option>
              <Option value="Archived">Da luu tru</Option>
            </Select>
            <Select
              allowClear
              showSearch
              placeholder="Chon nganh nghe"
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
        title="Quan ly bai dang"
        description="Theo doi bai dang cua nha tuyen dung va ung vien, xu ly vi pham nhanh chong."
        gradient="from-violet-600 via-purple-500 to-pink-500"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => (activeTab === 'employer' ? fetchEmployerPosts() : fetchJobSeekerPosts())}
          >
            Tai lai
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'employer' | 'jobseeker')}
        items={[
          {
            key: 'employer',
            label: 'Bai dang nha tuyen dung',
            children: renderEmployerTab()
          },
          {
            key: 'jobseeker',
            label: 'Bai dang ung vien',
            children: renderJobSeekerTab()
          }
        ]}
      />

      <Drawer
        title="Chi tiet bai dang"
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
          <p>Dang tai...</p>
        ) : detailState ? (
          <div className="space-y-6">
            <DetailSection title="Thong tin chung">
              <DetailField
                label="Loai bai dang"
                value={detailState.type === 'employer' ? 'Nha tuyen dung' : 'Ung vien'}
              />
              <DetailField label="Trang thai" value={detailState.data.status} />
              <DetailField
                label="Tao luc"
                value={formatDateTime(detailState.data.createdAt)}
              />
              <DetailField label="Tieu de" value={detailState.data.title} span={2} />
              <DetailField label="Chuyen muc" value={detailState.data.categoryName || undefined} />
            </DetailSection>

            {detailState.type === 'employer' ? (
              <>
                <DetailSection title="Thong tin cong viec">
                  <DetailField
                    label="Luong"
                    value={formatCurrency(detailState.data.salary)}
                  />
                  <DetailField
                    label="Dia diem"
                    value={detailState.data.location || undefined}
                  />
                  <DetailField
                    label="Mo ta cong viec"
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
                    label="Yeu cau"
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

                <DetailSection title="Thong tin lien he">
                  <DetailField
                    label="Nha tuyen dung"
                    value={detailState.data.employerName || undefined}
                  />
                  <DetailField
                    label="Email lien he"
                    value={detailState.data.employerEmail || undefined}
                  />
                  <DetailField
                    label="So dien thoai"
                    value={detailState.data.phoneContact || undefined}
                  />
                </DetailSection>
              </>
            ) : (
              <>
                <DetailSection title="Ho so ung vien">
                  <DetailField
                    label="Ho ten"
                    value={detailState.data.fullName || undefined}
                  />
                  <DetailField
                    label="Email"
                    value={detailState.data.jobSeekerEmail || undefined}
                  />
                  <DetailField
                    label="Gioi tinh"
                    value={detailState.data.gender || undefined}
                  />
                  <DetailField
                    label="Noi mong muon"
                    value={detailState.data.preferredLocation || undefined}
                  />
                  <DetailField
                    label="Gio lam mong muon"
                    value={detailState.data.preferredWorkHours || undefined}
                  />
                </DetailSection>

                <DetailSection title="Mo ta">
                  <DetailField
                    label="Thong tin"
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
          </div>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>
    </>
  );
};

export default AdminJobPostManagementPage;
