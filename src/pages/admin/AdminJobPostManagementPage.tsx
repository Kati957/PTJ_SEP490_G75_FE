import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Space,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Tag,
  Drawer,
  Descriptions,
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

const { Title, Paragraph } = Typography;
const { Option } = Select;

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
            <InputNumber
              placeholder="Category ID"
              style={{ width: 200 }}
              value={employerFilters.categoryId}
              onChange={(value) => handleEmployerFilterChange('categoryId', value ?? undefined)}
            />
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
            <InputNumber
              placeholder="Category ID"
              style={{ width: 200 }}
              value={jobSeekerFilters.categoryId}
              onChange={(value) => handleJobSeekerFilterChange('categoryId', value ?? undefined)}
            />
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
      <Card bordered={false} className="shadow-sm mb-4">
        <Space className="w-full flex justify-between" align="start">
          <Space direction="vertical" size={4}>
            <Title level={3} className="!mb-0">
              Quan ly bai dang
            </Title>
            <Paragraph className="!mb-0 text-gray-500">
              Theo doi bai dang cua nha tuyen dung va ung vien, xu ly vi pham nhanh chong.
            </Paragraph>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={() => (activeTab === 'employer' ? fetchEmployerPosts() : fetchJobSeekerPosts())}>
            Tai lai
          </Button>
        </Space>
      </Card>

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
        width={520}
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
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Loai bai dang">
              {detailState.type === 'employer' ? 'Nha tuyen dung' : 'Ung vien'}
            </Descriptions.Item>
            <Descriptions.Item label="Tieu de">{detailState.data.title}</Descriptions.Item>
            {detailState.type === 'employer' ? (
              <>
                {detailState.data.employerEmail && (
                  <Descriptions.Item label="Email">{detailState.data.employerEmail}</Descriptions.Item>
                )}
                {detailState.data.employerName && (
                  <Descriptions.Item label="Nha tuyen dung">
                    {detailState.data.employerName}
                  </Descriptions.Item>
                )}
                {detailState.data.categoryName && (
                  <Descriptions.Item label="Chuyen muc">
                    {detailState.data.categoryName}
                  </Descriptions.Item>
                )}
                {detailState.data.salary !== undefined && detailState.data.salary !== null && (
                  <Descriptions.Item label="Luong">
                    {detailState.data.salary.toLocaleString('vi-VN')} VND
                  </Descriptions.Item>
                )}
                {detailState.data.location && (
                  <Descriptions.Item label="Dia diem">{detailState.data.location}</Descriptions.Item>
                )}
                {detailState.data.requirements && (
                  <Descriptions.Item label="Yeu cau">
                    <div className="whitespace-pre-line">{detailState.data.requirements}</div>
                  </Descriptions.Item>
                )}
                {detailState.data.description && (
                  <Descriptions.Item label="Mo ta">
                    <div className="whitespace-pre-line">{detailState.data.description}</div>
                  </Descriptions.Item>
                )}
                {detailState.data.phoneContact && (
                  <Descriptions.Item label="Lien he">
                    {detailState.data.phoneContact}
                  </Descriptions.Item>
                )}
              </>
            ) : (
              <>
                {detailState.data.jobSeekerEmail && (
                  <Descriptions.Item label="Email">{detailState.data.jobSeekerEmail}</Descriptions.Item>
                )}
                {detailState.data.fullName && (
                  <Descriptions.Item label="Ho ten">{detailState.data.fullName}</Descriptions.Item>
                )}
                {detailState.data.categoryName && (
                  <Descriptions.Item label="Chuyen muc">
                    {detailState.data.categoryName}
                  </Descriptions.Item>
                )}
                {detailState.data.preferredLocation && (
                  <Descriptions.Item label="Noi mong muon">
                    {detailState.data.preferredLocation}
                  </Descriptions.Item>
                )}
                {detailState.data.preferredWorkHours && (
                  <Descriptions.Item label="Gio lam mong muon">
                    {detailState.data.preferredWorkHours}
                  </Descriptions.Item>
                )}
                {detailState.data.gender && (
                  <Descriptions.Item label="Gioi tinh">
                    {detailState.data.gender}
                  </Descriptions.Item>
                )}
                {detailState.data.description && (
                  <Descriptions.Item label="Mo ta">
                    <div className="whitespace-pre-line">{detailState.data.description}</div>
                  </Descriptions.Item>
                )}
              </>
            )}
            <Descriptions.Item label="Trang thai">
              {detailState.data.status}
            </Descriptions.Item>
            <Descriptions.Item label="Tao luc">
              {new Date(detailState.data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>
    </>
  );
};

export default AdminJobPostManagementPage;
