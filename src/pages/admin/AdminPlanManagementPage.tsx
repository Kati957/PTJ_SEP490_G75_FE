import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import adminPlanService from '../../features/admin/services/adminPlan.service';
import type {
  AdminPlan,
  AdminPlanPayload,
  AdminSubscriptionHistory,
  AdminTransactionHistory
} from '../../features/admin/types/adminPlan';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—');

const AdminPlanManagementPage: React.FC = () => {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [form] = Form.useForm<AdminPlanPayload>();
  const [saving, setSaving] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<string>('');
  const [subHistory, setSubHistory] = useState<AdminSubscriptionHistory[]>([]);
  const [transHistory, setTransHistory] = useState<AdminTransactionHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminPlanService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans', error);
      message.error('Không thể tải danh sách gói.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = useCallback((plan: AdminPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      planName: plan.planName,
      price: plan.price,
      maxPosts: plan.maxPosts,
      durationDays: plan.durationDays ?? undefined
    });
    setModalOpen(true);
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingPlan) {
        await adminPlanService.updatePlan(editingPlan.planId, values);
        message.success('Đã cập nhật gói.');
      } else {
        await adminPlanService.createPlan(values);
        message.success('Đã tạo gói.');
      }
      setModalOpen(false);
      await fetchPlans();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Validation')) return;
      console.error('Failed to save plan', error);
      message.error('Lưu gói thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((plan: AdminPlan) => {
    Modal.confirm({
      title: 'Xóa gói?',
      content: `Bạn chắc chắn muốn xóa gói "${plan.planName}"?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      async onOk() {
        try {
          await adminPlanService.deletePlan(plan.planId);
          message.success('Đã xóa gói.');
          await fetchPlans();
        } catch (error) {
          console.error('Failed to delete plan', error);
          message.error('Không thể xóa gói (có thể đã có giao dịch).');
        }
      }
    });
  }, [fetchPlans]);

  const planColumns: ColumnsType<AdminPlan> = useMemo(
    () => [
      { title: 'Tên gói', dataIndex: 'planName', key: 'planName' },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (v: number) => `${v.toLocaleString('vi-VN')} VND`
      },
      { title: 'Số bài tối đa', dataIndex: 'maxPosts', key: 'maxPosts', render: (v?: number) => v ?? '—' },
      { title: 'Thời hạn (ngày)', dataIndex: 'durationDays', key: 'durationDays', render: (v?: number | null) => v ?? '—' },
      {
        title: 'Tạo lúc',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (v?: string) => formatDate(v)
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
              Sửa
            </Button>
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record)}>
              Xóa
            </Button>
          </Space>
        )
      }
    ],
    [handleDelete, openEdit]
  );

  const subscriptionColumns: ColumnsType<AdminSubscriptionHistory> = useMemo(
    () => [
      { title: 'Gói', dataIndex: 'planName', key: 'planName', render: (_, r) => r.planName || `#${r.planId ?? ''}` },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (v?: number) => (typeof v === 'number' ? `${v.toLocaleString('vi-VN')} VND` : '—')
      },
      { title: 'Bài còn', dataIndex: 'remainingPosts', key: 'remainingPosts', render: (v?: number) => v ?? '—' },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status?: string) => {
          const color = status === 'Active' ? 'green' : status === 'Expired' ? 'red' : 'default';
          return <Tag color={color}>{status || '—'}</Tag>;
        }
      },
      { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (v?: string) => formatDate(v) },
      { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', render: (v?: string) => formatDate(v) }
    ],
    []
  );

  const transactionColumns: ColumnsType<AdminTransactionHistory> = useMemo(
    () => [
      {
        title: 'Giao dịch',
        dataIndex: 'transactionId',
        key: 'transactionId',
        render: (v: number, record) => `#${v} | ${record.planName || `Plan ${record.planId ?? ''}`}`
      },
      {
        title: 'Số tiền',
        dataIndex: 'amount',
        key: 'amount',
        render: (v?: number) => (typeof v === 'number' ? `${v.toLocaleString('vi-VN')} VND` : '—')
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status?: string) => {
          const color = status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'default';
          return <Tag color={color}>{status || '—'}</Tag>;
        }
      },
      { title: 'Mã order', dataIndex: 'payOsorderCode', key: 'payOsorderCode', render: (v?: string) => v || '—' },
      { title: 'Tạo lúc', dataIndex: 'createdAt', key: 'createdAt', render: (v?: string) => formatDate(v) },
      { title: 'Thanh toán', dataIndex: 'paidAt', key: 'paidAt', render: (v?: string) => formatDate(v) }
    ],
    []
  );

  const handleFetchHistory = async () => {
    const parsedId = Number(historyUserId);
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      message.warning('Nhập userId hợp lệ.');
      return;
    }
    setHistoryLoading(true);
    try {
      const [subs, trans] = await Promise.all([
        adminPlanService.getSubscriptionsByUser(parsedId),
        adminPlanService.getTransactionsByUser(parsedId)
      ]);
      setSubHistory(subs);
      setTransHistory(trans);
    } catch (error) {
      console.error('Failed to fetch history', error);
      message.error('Không thể tải lịch sử.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        title="Quản lý gói nâng cấp"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchPlans()} loading={loading}>
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm gói
            </Button>
          </Space>
        }
      >
        <Table rowKey={(r) => r.planId} dataSource={plans} columns={planColumns} loading={loading} />
      </Card>

      <Card
        title="Tra cứu lịch sử gói/thanh toán theo Employer"
        extra={
          <Space>
            <Input
              placeholder="Nhập userId"
              value={historyUserId}
              onChange={(e) => setHistoryUserId(e.target.value)}
              style={{ width: 160 }}
            />
            <Button icon={<SearchOutlined />} onClick={handleFetchHistory} loading={historyLoading}>
              Xem lịch sử
            </Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Typography.Title level={5}>Lịch sử gói</Typography.Title>
            <Table
              rowKey={(r) => r.subscriptionId}
              dataSource={subHistory}
              columns={subscriptionColumns}
              pagination={false}
              size="small"
              loading={historyLoading}
              locale={{ emptyText: 'Chưa có gói' }}
            />
          </Col>
          <Col xs={24} lg={12}>
            <Typography.Title level={5}>Lịch sử thanh toán</Typography.Title>
            <Table
              rowKey={(r) => r.transactionId}
              dataSource={transHistory}
              columns={transactionColumns}
              pagination={false}
              size="small"
              loading={historyLoading}
              locale={{ emptyText: 'Chưa có giao dịch' }}
            />
          </Col>
        </Row>
      </Card>

      <Modal
        title={editingPlan ? 'Sửa gói' : 'Thêm gói mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="planName"
            label="Tên gói"
            rules={[{ required: true, message: 'Nhập tên gói' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[{ required: true, message: 'Nhập giá' }]}
          >
            <InputNumber min={0} className="w-full" step={1000} />
          </Form.Item>
          <Form.Item name="maxPosts" label="Số bài tối đa">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="durationDays" label="Thời hạn (ngày)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPlanManagementPage;
