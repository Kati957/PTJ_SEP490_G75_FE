import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  message,
  Drawer,
  Descriptions,
  Modal,
  Form,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { EyeOutlined, ReloadOutlined, CheckOutlined, StopOutlined, SearchOutlined } from '@ant-design/icons';
import adminEmployerRegistrationService from '../../features/admin/services/adminEmployerRegistration.service';
import type {
  AdminEmployerRegDetail,
  AdminEmployerRegListItem,
  AdminEmployerRegStatus,
} from '../../features/admin/types/employerRegistration';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Option } = Select;

const statusColors: Record<AdminEmployerRegStatus, string> = {
  Pending: 'gold',
  Approved: 'green',
  Rejected: 'red',
};

const AdminEmployerRegistrationPage: React.FC = () => {
  const [data, setData] = useState<AdminEmployerRegListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AdminEmployerRegDetail | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ status: AdminEmployerRegStatus | 'All'; keyword: string }>({
    status: 'Pending',
    keyword: '',
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  const normalizedFilters = useMemo(
    () => ({
      status: filters.status,
      keyword: filters.keyword.trim() || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }),
    [filters, pagination.current, pagination.pageSize]
  );

  const fetchData = useCallback(
    async (page = pagination.current ?? 1, pageSize = pagination.pageSize ?? 10) => {
      setLoading(true);
      try {
        const res = await adminEmployerRegistrationService.getRequests({
          ...normalizedFilters,
          page,
          pageSize,
        });
        setData(res.items);
        setPagination((prev) => ({
          ...prev,
          current: res.page,
          pageSize: res.pageSize,
          total: res.total,
        }));
      } catch (error) {
        console.error('Failed to load employer registrations', error);
        message.error('Không thể tải danh sách hồ sơ.');
      } finally {
        setLoading(false);
      }
    },
    [normalizedFilters, pagination.current, pagination.pageSize]
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminEmployerRegistrationService.getRequestDetail(id);
      setDetail(res);
    } catch (error) {
      console.error('Failed to load detail', error);
      message.error('Không thể tải chi tiết hồ sơ.');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const approve = async (id: number) => {
    setActionId(id);
    try {
      await adminEmployerRegistrationService.approveRequest(id);
      message.success('Duyệt hồ sơ thành công.');
      await fetchData();
      if (detail?.requestId === id) {
        const refreshed = await adminEmployerRegistrationService.getRequestDetail(id);
        setDetail(refreshed);
      }
    } catch (error) {
      console.error('Approve failed', error);
      message.error('Không thể duyệt hồ sơ.');
    } finally {
      setActionId(null);
    }
  };

  const submitReject = async () => {
    if (!actionId) return;
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối.');
      return;
    }
    setActionId(actionId);
    try {
      await adminEmployerRegistrationService.rejectRequest(actionId, rejectReason.trim());
      message.success('Đã từ chối hồ sơ.');
      setRejectModalOpen(false);
      setRejectReason('');
      await fetchData();
      if (detail?.requestId === actionId) {
        const refreshed = await adminEmployerRegistrationService.getRequestDetail(actionId);
        setDetail(refreshed);
      }
    } catch (error) {
      console.error('Reject failed', error);
      message.error('Không thể từ chối hồ sơ.');
    } finally {
      setActionId(null);
    }
  };

  const columns: ColumnsType<AdminEmployerRegListItem> = [
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </Space>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 140,
    },
    {
      title: 'SĐT liên hệ',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: AdminEmployerRegStatus) => <Tag color={statusColors[value]}>{value}</Tag>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.requestId)}>
            Chi tiết
          </Button>
          <Button
            icon={<CheckOutlined />}
            size="small"
            type="primary"
            disabled={record.status !== 'Pending'}
            loading={actionId === record.requestId}
            onClick={() => approve(record.requestId)}
          >
            Duyệt
          </Button>
          <Button
            icon={<StopOutlined />}
            size="small"
            danger
            disabled={record.status !== 'Pending'}
            onClick={() => {
              setActionId(record.requestId);
              setRejectModalOpen(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <AdminSectionHeader
        title="Duyệt nhà tuyển dụng"
        description="Quản lý các hồ sơ đăng ký tài khoản nhà tuyển dụng."
        gradient="from-cyan-600 via-blue-600 to-indigo-600"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} ghost>
            Tải lại
          </Button>
        }
      />

      <Card bordered={false} className="shadow-sm mb-4 border-0 bg-white/90 backdrop-blur-lg" bodyStyle={{ padding: 20 }}>
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo công ty, email, username..."
            allowClear
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
          />
          <Space size="middle" wrap>
            <Select
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value as AdminEmployerRegStatus | 'All' }))}
              style={{ minWidth: 180 }}
            >
              <Option value="All">Tất cả trạng thái</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="requestId"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          scroll={{ x: 1000 }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title="Chi tiết hồ sơ"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : detail ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Công ty">{detail.companyName}</Descriptions.Item>
            <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
            <Descriptions.Item label="Username">{detail.username}</Descriptions.Item>
            <Descriptions.Item label="SĐT liên hệ">{detail.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="Email liên hệ">{detail.contactEmail || '—'}</Descriptions.Item>
            <Descriptions.Item label="Người liên hệ">{detail.contactPerson || '—'}</Descriptions.Item>
            <Descriptions.Item label="Website">{detail.website || '—'}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{detail.address || '—'}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{detail.companyDescription || '—'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColors[detail.status]}>{detail.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Admin note">{detail.adminNote || '—'}</Descriptions.Item>
            <Descriptions.Item label="Gửi lúc">
              {new Date(detail.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {detail.reviewedAt && (
              <Descriptions.Item label="Xử lý lúc">
                {new Date(detail.reviewedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Modal
        title="Từ chối hồ sơ"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setActionId(null);
        }}
        onOk={submitReject}
        okText="Từ chối"
        okButtonProps={{ danger: true, loading: actionId !== null }}
      >
        <Form layout="vertical">
          <Form.Item label="Lý do" required>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
            />
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">Thông báo sẽ được gửi đến email đã đăng ký.</Typography.Text>
      </Modal>
    </>
  );
};

export default AdminEmployerRegistrationPage;
