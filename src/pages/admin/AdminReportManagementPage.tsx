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
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import adminReportService from '../../features/admin/services/adminReport.service';
import type {
  AdminReport,
  AdminReportDetail,
  AdminSolvedReport
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

type DetailRecord =
  | { type: 'pending'; data: AdminReportDetail }
  | { type: 'solved'; data: AdminReportDetail };

interface ResolveFormValues {
  actionTaken: 'BanUser' | 'UnbanUser' | 'DeletePost' | 'Warn' | 'Ignore';
  reason?: string;
  affectedUserId?: number;
  affectedPostId?: number;
  affectedPostType?: 'EmployerPost' | 'JobSeekerPost';
}

const AdminReportManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'solved'>('pending');

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

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DetailRecord | null>(null);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<number | null>(null);
  const [resolveForm] = Form.useForm<ResolveFormValues>();

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
        setPendingPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch pending reports', error);
        message.error('Khong the tai danh sach report cho xu ly');
      } finally {
        setPendingLoading(false);
      }
    },
    [pendingFilterParams, pendingPagination.current, pendingPagination.pageSize]
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
        setSolvedPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to fetch solved reports', error);
        message.error('Khong the tai danh sach report da xu ly');
      } finally {
        setSolvedLoading(false);
      }
    },
    [solvedFilterParams, solvedPagination.current, solvedPagination.pageSize]
  );

  useEffect(() => {
    void fetchPendingReports();
  }, [fetchPendingReports]);

  useEffect(() => {
    void fetchSolvedReports();
  }, [fetchSolvedReports]);

  const handlePendingTableChange = (pagination: TablePaginationConfig) => {
    setPendingPagination(pagination);
    void fetchPendingReports(pagination.current, pagination.pageSize);
  };

  const handleSolvedTableChange = (pagination: TablePaginationConfig) => {
    setSolvedPagination(pagination);
    void fetchSolvedReports(pagination.current, pagination.pageSize);
  };

  const handlePendingFilterChange = (key: keyof PendingFilters, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    setPendingPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleSolvedFilterChange = (key: keyof SolvedFilters, value: string) => {
    setSolvedFilters((prev) => ({ ...prev, [key]: value }));
    setSolvedPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openDetail = async (id: number, type: 'pending' | 'solved') => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminReportService.getReportDetail(id);
      setDetailRecord({ type, data: detail });
    } catch (error) {
      console.error('Failed to fetch report detail', error);
      message.error('Khong the tai chi tiet report');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openResolveModal = (report: AdminReport) => {
    setResolvingReportId(report.reportId);
    resolveForm.resetFields();
    resolveForm.setFieldsValue({
      actionTaken: 'Warn',
      affectedPostId: report.reportType.includes('Post') ? (report.reportType === 'EmployerPost' ? report.reportId : undefined) : undefined,
      affectedPostType: report.reportType === 'EmployerPost' ? 'EmployerPost' : report.reportType === 'JobSeekerPost' ? 'JobSeekerPost' : undefined
    });
    setResolveModalOpen(true);
  };

  const handleResolveReport = async (values: ResolveFormValues) => {
    if (resolvingReportId === null) return;
    setResolveSubmitting(true);
    try {
      await adminReportService.resolveReport(resolvingReportId, values);
      message.success('Da xu ly report thanh cong');
      setResolveModalOpen(false);
      resolveForm.resetFields();
      await fetchPendingReports();
      await fetchSolvedReports();
    } catch (error) {
      console.error('Failed to resolve report', error);
      message.error('Khong the xu ly report');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const reportTypeTag = (type: string) => {
    switch (type) {
      case 'EmployerPost':
        return <Tag color="purple">Bai dang nha tuyen dung</Tag>;
      case 'JobSeekerPost':
        return <Tag color="blue">Bai dang ung vien</Tag>;
      case 'User':
        return <Tag color="gold">Nguoi dung</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const pendingColumns: ColumnsType<AdminReport> = [
    {
      title: 'Loai',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (value: string) => reportTypeTag(value)
    },
    {
      title: 'Nguoi bao cao',
      dataIndex: 'reporterEmail',
      key: 'reporterEmail',
      width: 220
    },
    {
      title: 'Muc tieu',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'Ly do',
      dataIndex: 'reason',
      key: 'reason',
      render: (value?: string | null) => (
        <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 200, display: 'inline-block' }}>
          {value ?? '---'}
        </Text>
      )
    },
    {
      title: 'Ngay tao',
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'pending')}>
            Xem
          </Button>
          <Button icon={<ToolOutlined />} type="primary" size="small" onClick={() => openResolveModal(record)}>
            Xu ly
          </Button>
        </Space>
      )
    }
  ];

  const solvedColumns: ColumnsType<AdminSolvedReport> = [
    {
      title: 'Loai',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 180,
      render: (value?: string | null) => (value ? reportTypeTag(value) : '---')
    },
    {
      title: 'Hanh dong',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      render: (value: string) => (
        <Tag color="green">
          {value}
        </Tag>
      )
    },
    {
      title: 'Admin xu ly',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
      width: 220
    },
    {
      title: 'Nguoi bi anh huong',
      dataIndex: 'targetUserEmail',
      key: 'targetUserEmail',
      width: 220,
      render: (value?: string | null) => value ?? '---'
    },
    {
      title: 'Ngay xu ly',
      dataIndex: 'solvedAt',
      key: 'solvedAt',
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
      width: 160,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.reportId, 'solved')}>
          Xem
        </Button>
      )
    }
  ];

  const renderPendingTab = () => (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tim theo email hoac ly do..."
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
            <Option value="EmployerPost">Bai dang nha tuyen dung</Option>
            <Option value="JobSeekerPost">Bai dang ung vien</Option>
            <Option value="User">Nguoi dung</Option>
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
            placeholder="Loc theo email admin xu ly..."
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
            <Option value="EmployerPost">Bai dang nha tuyen dung</Option>
            <Option value="JobSeekerPost">Bai dang ung vien</Option>
            <Option value="User">Nguoi dung</Option>
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

  return (
    <>
      <AdminSectionHeader
        title="Quan ly bao cao"
        description="Theo doi cac bao cao vi pham va xu ly nhanh chong cac truong hop nhay cam."
        gradient="from-rose-600 via-red-500 to-orange-500"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => (activeTab === 'pending' ? fetchPendingReports() : fetchSolvedReports())}
          >
            Tai lai
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'pending' | 'solved')}
        items={[
          { key: 'pending', label: 'Report cho xu ly', children: renderPendingTab() },
          { key: 'solved', label: 'Report da xu ly', children: renderSolvedTab() }
        ]}
      />

      <Drawer
        title="Chi tiet report"
        placement="right"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Dang tai...</p>
        ) : detailRecord ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Loai report">
              {reportTypeTag(detailRecord.data.reportType)}
            </Descriptions.Item>
            <Descriptions.Item label="Nguoi bao cao">
              {detailRecord.data.reporterEmail}
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
              <Descriptions.Item label="Ly do">{detailRecord.data.reason}</Descriptions.Item>
            )}
            <Descriptions.Item label="Trang thai">{detailRecord.data.status}</Descriptions.Item>
            <Descriptions.Item label="Thoi gian">
              {new Date(detailRecord.data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {detailRecord.data.employerPostTitle && (
              <Descriptions.Item label="Bai dang nha tuyen dung">
                {detailRecord.data.employerPostTitle}
              </Descriptions.Item>
            )}
            {detailRecord.data.jobSeekerPostTitle && (
              <Descriptions.Item label="Bai dang ung vien">
                {detailRecord.data.jobSeekerPostTitle}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>

      <Modal
        title="Xu ly report"
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveSubmitting}
        okText="Xac nhan"
        cancelText="Huy"
      >
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveReport}>
          <Form.Item
            name="actionTaken"
            label="Hanh dong"
            rules={[{ required: true, message: 'Vui long chon hanh dong' }]}
          >
            <Select placeholder="Chon cach xu ly">
              <Option value="BanUser">Cam nguoi dung</Option>
              <Option value="UnbanUser">Bo cam nguoi dung</Option>
              <Option value="DeletePost">Xoa bai dang</Option>
              <Option value="Warn">Canh bao</Option>
              <Option value="Ignore">Bo qua</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Ly do">
            <Input.TextArea rows={3} placeholder="Ghi chu xu ly (neu co)" />
          </Form.Item>

          <Form.Item name="affectedUserId" label="Nguoi bi tac dong (User ID)">
            <Input placeholder="Nhap ID nguoi dung neu hanh dong anh huong" />
          </Form.Item>

          <Form.Item name="affectedPostId" label="Bai dang bi tac dong (Post ID)">
            <Input placeholder="Nhap ID bai dang neu hanh dong anh huong" />
          </Form.Item>

          <Form.Item name="affectedPostType" label="Loai bai dang">
            <Select allowClear placeholder="Chon loai bai dang">
              <Option value="EmployerPost">Bai dang nha tuyen dung</Option>
              <Option value="JobSeekerPost">Bai dang ung vien</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminReportManagementPage;
