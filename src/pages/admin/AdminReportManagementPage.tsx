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
import type {
  AdminReport,
  AdminReportDetail,
  AdminResolveSystemReportPayload,
  AdminSolvedReport,
  AdminSystemReport,
  AdminSystemReportDetail
} from '../../features/admin/types/report';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Text } = Typography;
const { Option } = Select;

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

type DetailRecord =
  | { type: 'pending'; data: AdminReportDetail }
  | { type: 'solved'; data: AdminReportDetail }
  | { type: 'system'; data: AdminSystemReportDetail };

interface ResolveFormValues {
  actionTaken: 'BanUser' | 'UnbanUser' | 'DeletePost' | 'Warn' | 'Ignore';
  reason?: string;
  affectedUserId?: number;
  affectedPostId?: number;
  affectedPostType?: 'EmployerPost' | 'JobSeekerPost';
}

interface ResolveSystemFormValues extends AdminResolveSystemReportPayload {}

const AdminReportManagementPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('posts');
  const [postTab, setPostTab] = useState<PostTabKey>('pending');

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

  const systemFilterParams = useMemo(
    () => ({
      status: systemFilters.status !== 'all' ? systemFilters.status : undefined,
      keyword: systemFilters.keyword.trim() || undefined
    }),
    [systemFilters]
  );
  const sortedReportTypes = useMemo(() => [...reportTypes].sort(), [reportTypes]);

  const fetchPendingReports = useCallback(
    async (page = pendingPagination.current ?? 1, pageSize = pendingPagination.pageSize ?? 10) => {
      setPendingLoading(true);
      try {
        const response = await adminReportService.getPendingReports({
          ...pendingFilterParams,
          page,
          pageSize
        });
        setPendingReports(response.items);
        addReportTypes(response.items.map((item) => item.reportType));
        setPendingPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch pending reports', error);
        message.error('Không thể tải danh sách report chờ xử lý');
      } finally {
        setPendingLoading(false);
      }
    },
    [addReportTypes, pendingFilterParams, pendingPagination.current, pendingPagination.pageSize]
  );

  const fetchSolvedReports = useCallback(
    async (page = solvedPagination.current ?? 1, pageSize = solvedPagination.pageSize ?? 10) => {
      setSolvedLoading(true);
      try {
        const response = await adminReportService.getSolvedReports({
          ...solvedFilterParams,
          page,
          pageSize
        });
        setSolvedReports(response.items);
        addReportTypes(response.items.map((item) => item.reportType));
        setSolvedPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch solved reports', error);
        message.error('Không thể tải danh sách report đã xử lý');
      } finally {
        setSolvedLoading(false);
      }
    },
    [addReportTypes, solvedFilterParams, solvedPagination.current, solvedPagination.pageSize]
  );

  const fetchSystemReports = useCallback(
    async (page = systemPagination.current ?? 1, pageSize = systemPagination.pageSize ?? 10) => {
      setSystemLoading(true);
      try {
        const response = await adminSystemReportService.getSystemReports({
          ...systemFilterParams,
          page,
          pageSize
        });
        setSystemReports(response.items);
        setSystemPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch system reports', error);
        message.error('Không thể tải danh sách báo cáo hệ thống');
      } finally {
        setSystemLoading(false);
      }
    },
    [systemFilterParams, systemPagination.current, systemPagination.pageSize]
  );

  useEffect(() => {
    void fetchPendingReports();
  }, [fetchPendingReports]);

  useEffect(() => {
    void fetchSolvedReports();
  }, [fetchSolvedReports]);

  useEffect(() => {
    void fetchSystemReports();
  }, [fetchSystemReports]);

  const handlePendingTableChange = (pagination: TablePaginationConfig) => {
    setPendingPagination(pagination);
    void fetchPendingReports(pagination.current, pagination.pageSize);
  };

  const handleSolvedTableChange = (pagination: TablePaginationConfig) => {
    setSolvedPagination(pagination);
    void fetchSolvedReports(pagination.current, pagination.pageSize);
  };

  const handleSystemTableChange = (pagination: TablePaginationConfig) => {
    setSystemPagination(pagination);
    void fetchSystemReports(pagination.current, pagination.pageSize);
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

  const openDetail = async (id: number, type: DetailRecord['type']) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      if (type === 'system') {
        const detail = await adminSystemReportService.getSystemReportDetail(id);
        setDetailRecord({ type, data: detail });
      } else {
        const detail = await adminReportService.getReportDetail(id);
        setDetailRecord({ type, data: detail });
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
    setResolvingReportId(reportId);
    resolveForm.resetFields();
    resolveForm.setFieldsValue({ actionTaken: 'Warn' });
    setResolveModalOpen(true);
  };

  const handleResolveReport = async (values: ResolveFormValues) => {
    if (resolvingReportId === null) return;
    setResolveSubmitting(true);
    try {
      await adminReportService.resolveReport(resolvingReportId, values);
      message.success('Đã xử lý report thành công');
      setResolveModalOpen(false);
      await Promise.all([fetchPendingReports(), fetchSolvedReports()]);
    } catch (error) {
      console.error('Failed to resolve report', error);
      message.error('Không thể xử lý report');
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

  const handleResolveSystemReport = async (values: ResolveSystemFormValues) => {
    if (resolvingSystemId === null) return;
    setSystemResolveSubmitting(true);
    try {
      await adminSystemReportService.resolveSystemReport(resolvingSystemId, values);
      message.success('Đã cập nhật báo cáo hệ thống');
      setSystemResolveModalOpen(false);
      await fetchSystemReports();
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
            Cho xu ly
          </Tag>
        );
      case 'Solved':
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Da xu ly
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'pending')}>
            Xem
          </Button>
          <Button icon={<ToolOutlined />} type="primary" size="small" onClick={() => openResolveModal(record.reportId)}>
            Xu ly
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
      render: (value?: string | null) => (value ? reportTypeTag(value) : '---')
    },
    {
      title: 'Hành động',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      render: (value: string) => <Tag color="green">{value}</Tag>
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
      width: 160,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'solved')}>
          Xem
        </Button>
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
          rowKey="reportId"
          loading={pendingLoading}
          columns={pendingColumns}
          dataSource={pendingReports}
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
            <Option value="all">Tat ca trang thai</Option>
            <Option value="Pending">Cho xu ly</Option>
            <Option value="Solved">Da xu ly</Option>
          </Select>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="reportId"
          loading={systemLoading}
          columns={systemColumns}
          dataSource={systemReports}
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
      void fetchSystemReports();
      return;
    }
    if (postTab === 'pending') {
      void fetchPendingReports();
    } else {
      void fetchSolvedReports();
    }
  };

  const renderDetailContent = () => {
    if (!detailRecord) {
      return <p>Không có dữ liệu.</p>;
    }

    if (detailRecord.type === 'system') {
      return (
        <Descriptions column={1} bordered size="small">
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
      );
    }

    return (
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Loại report">
          {reportTypeTag(detailRecord.data.reportType)}
        </Descriptions.Item>
        <Descriptions.Item label="Người báo cáo">{detailRecord.data.reporterEmail}</Descriptions.Item>
        {detailRecord.data.targetUserEmail && (
          <Descriptions.Item label="Người bị báo cáo">
            {detailRecord.data.targetUserEmail}
          </Descriptions.Item>
        )}
        {detailRecord.data.targetUserRole && (
          <Descriptions.Item label="Vai trò người bị báo cáo">
            {detailRecord.data.targetUserRole}
          </Descriptions.Item>
        )}
        {detailRecord.data.reason && (
          <Descriptions.Item label="Lý do">{detailRecord.data.reason}</Descriptions.Item>
        )}
        <Descriptions.Item label="Trạng thái">{detailRecord.data.status}</Descriptions.Item>
        <Descriptions.Item label="Thời gian">
          {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
        </Descriptions.Item>
        {detailRecord.data.employerPostTitle && (
          <Descriptions.Item label="Bài đăng nhà tuyển dụng">
            {detailRecord.data.employerPostTitle}
          </Descriptions.Item>
        )}
        {detailRecord.data.jobSeekerPostTitle && (
          <Descriptions.Item label="Bài đăng ứng viên">
            {detailRecord.data.jobSeekerPostTitle}
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  return (
    <>
      <AdminSectionHeader
        title="Quản lý báo cáo"
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
          { key: 'posts', label: 'Báo cáo bài đăng', children: renderPostSection() },
          { key: 'system', label: 'Báo cáo hệ thống', children: renderSystemTab() }
        ]}
      />

      <Drawer
        title="Chi tiết report"
        placement="right"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? <p>Đang tải...</p> : renderDetailContent()}
      </Drawer>

      <Modal
        title="Xử lý report"
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
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
              <Option value="BanUser">Cấm người dùng</Option>
              <Option value="UnbanUser">Bỏ cấm người dùng</Option>
              <Option value="DeletePost">Xóa bài đăng</Option>
              <Option value="Warn">Cảnh báo</Option>
              <Option value="Ignore">Bỏ qua</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Lý do">
            <Input.TextArea rows={3} placeholder="Ghi chú xử lý (nếu có)" />
          </Form.Item>

          <Form.Item name="affectedUserId" label="Người bị tác động (User ID)">
            <Input placeholder="Nhập ID người dùng nếu hành động ảnh hưởng" />
          </Form.Item>

          <Form.Item name="affectedPostId" label="Bài đăng bị tác động (Post ID)">
            <Input placeholder="Nhập ID bài đăng nếu hành động ảnh hưởng" />
          </Form.Item>

          <Form.Item name="affectedPostType" label="Loại bài đăng">
            <Select allowClear placeholder="Chọn loại bài đăng">
              <Option value="EmployerPost">Bài đăng nhà tuyển dụng</Option>
              <Option value="JobSeekerPost">Bài đăng ứng viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Xử lý report bài đăng"
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
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
              <Option value="BanUser">Cấm người dùng</Option>
              <Option value="UnbanUser">Bỏ cấm người dùng</Option>
              <Option value="DeletePost">Xóa bài đăng</Option>
              <Option value="Warn">Cảnh báo</Option>
              <Option value="Ignore">Bỏ qua</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Lý do">
            <Input.TextArea rows={3} placeholder="Ghi chú xử lý (nếu có)" />
          </Form.Item>

          <Form.Item name="affectedUserId" label="Người bị tác động (User ID)">
            <Input placeholder="Nhập ID người dùng nếu hành động ảnh hưởng" />
          </Form.Item>

          <Form.Item name="affectedPostId" label="Bài đăng bị tác động (Post ID)">
            <Input placeholder="Nhập ID bài đăng nếu hành động ảnh hưởng" />
          </Form.Item>

          <Form.Item name="affectedPostType" label="Loại bài đăng">
            <Select allowClear placeholder="Chọn loại bài đăng">
              <Option value="EmployerPost">Bài đăng nhà tuyển dụng</Option>
              <Option value="JobSeekerPost">Bài đăng ứng viên</Option>
            </Select>
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
