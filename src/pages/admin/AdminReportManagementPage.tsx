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
        message.error('Khng th ti danh sch report ch x l');
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
        message.error('Khng th ti danh sch report  x l');
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
        message.error('Khng th ti danh sch bo co h thng');
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
      message.error('Khng th ti chi tit report');
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
      message.success(' x l report thnh cng');
      setResolveModalOpen(false);
      await Promise.all([fetchPendingReports(), fetchSolvedReports()]);
    } catch (error) {
      console.error('Failed to resolve report', error);
      message.error('Khng th x l report');
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
      message.success(' cp nht bo co h thng');
      setSystemResolveModalOpen(false);
      await fetchSystemReports();
    } catch (error) {
      console.error('Failed to resolve system report', error);
      message.error('Khng th cp nht bo co h thng');
    } finally {
      setSystemResolveSubmitting(false);
    }
  };

  const reportTypeTag = (type: string) => {
    switch (type) {
      case 'EmployerPost':
        return <Tag color="purple">Bi ng nh tuyn dng</Tag>;
      case 'JobSeekerPost':
        return <Tag color="blue">Bi ng ng vin</Tag>;
      case 'User':
        return <Tag color="gold">Ngi dng</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const reportTypeLabel = (type: string) => {
    switch (type) {
      case 'EmployerPost':
        return 'Bi ng nh tuyn dng';
      case 'JobSeekerPost':
        return 'Bi ng ng vin';
      case 'User':
        return 'Ngi dng';
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
      title: 'Loi',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (value: string) => reportTypeTag(value)
    },
    {
      title: 'Ngi bo co',
      dataIndex: 'reporterEmail',
      key: 'reporterEmail',
      width: 220
    },
    {
      title: 'Mc tiu',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'L do',
      dataIndex: 'reason',
      key: 'reason',
      render: (value?: string | null) => (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220, display: 'inline-block' }}>
          {value ?? '---'}
        </Text>
      )
    },
    {
      title: 'Ngy to',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Hnh ng',
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
      title: 'Loi',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (value?: string | null) => (value ? reportTypeTag(value) : '---')
    },
    {
      title: 'Hnh ng',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      render: (value: string) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Admin x l',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
      width: 220
    },
    {
      title: 'Ngi b nh hng',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'Ngy x l',
      dataIndex: 'solvedAt',
      key: 'solvedAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Hnh ng',
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
      title: 'Tiu ',
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
      title: 'Ngi gi',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 220
    },
    {
      title: 'Trng thi',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (value: string) => statusTag(value)
    },
    {
      title: 'Ngy to',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Cp nht',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      render: (value?: string | null) => formatDateTime(value)
    },
    {
      title: 'Hnh ng',
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
              nh du  x l
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
            placeholder="Tm theo email hoc l do..."
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
            placeholder="Lc theo email admin x l..."
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
            placeholder="Tm theo tiu , m t hoc email..."
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
      return <p>Khong co du lieu.</p>;
    }

    if (detailRecord.type === 'system') {
      return (
        <Card bordered={false} className="shadow-sm">
          <Descriptions
            bordered
            size="middle"
            layout="vertical"
            column={2}
            className="w-full rounded-xl"
            labelStyle={{ fontWeight: 600, color: '#475569', width: 200 }}
          >
            <Descriptions.Item label="Tieu de" span={2}>{detailRecord.data.title}</Descriptions.Item>
            <Descriptions.Item label="Nguoi gui">{detailRecord.data.userEmail}</Descriptions.Item>
            {detailRecord.data.fullName && (
              <Descriptions.Item label="Ten hien thi">{detailRecord.data.fullName}</Descriptions.Item>
            )}
            <Descriptions.Item label="Trang thai">{statusTag(detailRecord.data.status)}</Descriptions.Item>
            <Descriptions.Item label="Ngay tao">
              {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cap nhat">
              {detailRecord.data.updatedAt
                ? new Date(detailRecord.data.updatedAt).toLocaleString('vi-VN')
                : '---'}
            </Descriptions.Item>
            {detailRecord.data.description && (
              <Descriptions.Item label="Mo ta" span={2}>{detailRecord.data.description}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      );
    }

    return (
      <Card bordered={false} className="shadow-sm">
        <Descriptions
          bordered
          size="middle"
          layout="vertical"
          column={2}
          className="w-full rounded-xl"
          labelStyle={{ fontWeight: 600, color: '#475569', width: 220 }}
        >
          <Descriptions.Item label="Loai report">
            {reportTypeTag(detailRecord.data.reportType)}
          </Descriptions.Item>
          <Descriptions.Item label="Trang thai">{statusTag(detailRecord.data.status)}</Descriptions.Item>
          <Descriptions.Item label="Nguoi bao cao">{detailRecord.data.reporterEmail}</Descriptions.Item>
          <Descriptions.Item label="Thoi gian">
            {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          {detailRecord.data.targetUserEmail && (
            <Descriptions.Item label="Nguoi bi bao cao">
              {detailRecord.data.targetUserEmail}
            </Descriptions.Item>
          )}
          {detailRecord.data.targetUserRole && (
            <Descriptions.Item label="Vai tro nguoi bi bao cao">
              {detailRecord.data.targetUserRole}
            </Descriptions.Item>
          )}
          {detailRecord.data.reason && (
            <Descriptions.Item label="Ly do" span={2}>
              {detailRecord.data.reason}
            </Descriptions.Item>
          )}
          {detailRecord.data.employerPostTitle && (
            <Descriptions.Item label="Bai dang nha tuyen dung" span={2}>
              {detailRecord.data.employerPostTitle}
            </Descriptions.Item>
          )}
          {detailRecord.data.jobSeekerPostTitle && (
            <Descriptions.Item label="Bai dang ung vien" span={2}>
              {detailRecord.data.jobSeekerPostTitle}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
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
            Ti li
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
        title="Chi tit report"
        placement="right"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? <p>ang ti...</p> : renderDetailContent()}
      </Drawer>

      <Modal
        title="X l report"
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveSubmitting}
        okText="Xc nhn"
        cancelText="Hy"
      >
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveReport}>
          <Form.Item
            name="actionTaken"
            label="Hnh ng"
            rules={[{ required: true, message: 'Vui lng chn hnh ng' }]}
          >
            <Select placeholder="Chn cch x l">
              <Option value="BanUser">Cm ngi dng</Option>
              <Option value="UnbanUser">B cm ngi dng</Option>
              <Option value="DeletePost">Xa bi ng</Option>
              <Option value="Warn">Cnh bo</Option>
              <Option value="Ignore">B qua</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="L do">
            <Input.TextArea rows={3} placeholder="Ghi ch x l (nu c)" />
          </Form.Item>

          <Form.Item name="affectedUserId" label="Ngi b tc ng (User ID)">
            <Input placeholder="Nhp ID ngi dng nu hnh ng nh hng" />
          </Form.Item>

          <Form.Item name="affectedPostId" label="Bi ng b tc ng (Post ID)">
            <Input placeholder="Nhp ID bi ng nu hnh ng nh hng" />
          </Form.Item>

          <Form.Item name="affectedPostType" label="Loi bi ng">
            <Select allowClear placeholder="Chn loi bi ng">
              <Option value="EmployerPost">Bi ng nh tuyn dng</Option>
              <Option value="JobSeekerPost">Bi ng ng vin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="X l report bi ng"
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveSubmitting}
        okText="Xc nhn"
        cancelText="Hy"
      >
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveReport}>
          <Form.Item
            name="actionTaken"
            label="Hnh ng"
            rules={[{ required: true, message: 'Vui lng chn hnh ng' }]}
          >
            <Select placeholder="Chn cch x l">
              <Option value="BanUser">Cm ngi dng</Option>
              <Option value="UnbanUser">B cm ngi dng</Option>
              <Option value="DeletePost">Xa bi ng</Option>
              <Option value="Warn">Cnh bo</Option>
              <Option value="Ignore">B qua</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="L do">
            <Input.TextArea rows={3} placeholder="Ghi ch x l (nu c)" />
          </Form.Item>

          <Form.Item name="affectedUserId" label="Ngi b tc ng (User ID)">
            <Input placeholder="Nhp ID ngi dng nu hnh ng nh hng" />
          </Form.Item>

          <Form.Item name="affectedPostId" label="Bi ng b tc ng (Post ID)">
            <Input placeholder="Nhp ID bi ng nu hnh ng nh hng" />
          </Form.Item>

          <Form.Item name="affectedPostType" label="Loi bi ng">
            <Select allowClear placeholder="Chn loi bi ng">
              <Option value="EmployerPost">Bi ng nh tuyn dng</Option>
              <Option value="JobSeekerPost">Bi ng ng vin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="X l bo co h thng"
        open={systemResolveModalOpen}
        onCancel={() => setSystemResolveModalOpen(false)}
        onOk={() => systemResolveForm.submit()}
        confirmLoading={systemResolveSubmitting}
        okText="Cp nht"
        cancelText="Hy"
      >
        <Form form={systemResolveForm} layout="vertical" onFinish={handleResolveSystemReport}>
          <Form.Item
            name="action"
            label="Hnh ng"
            rules={[{ required: true, message: 'Vui lng chn hnh ng' }]}
          >
            <Select placeholder="Chn cch x l">
              <Option value="MarkSolved">nh du  x l</Option>
              <Option value="Ignore">B qua</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi ch">
            <Input.TextArea rows={3} placeholder="Nhp ghi ch gi n ngi dng (nu c)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminReportManagementPage;
