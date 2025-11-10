import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Switch,
  message,
  Drawer,
  Descriptions
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PoweroffOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import adminCategoryService from '../../features/admin/services/adminCategory.service';
import type {
  AdminCategory,
  AdminCategoryDetail,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload
} from '../../features/admin/types/category';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface CategoryFormValues {
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

interface FilterState {
  keyword: string;
  type: string;
  status: 'all' | 'active' | 'inactive';
}

const AdminCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    type: 'all',
    status: 'all'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDetail | null>(null);

  const normalizedFilters = useMemo<AdminCategoryFilters>(
    () => ({
      keyword: filters.keyword.trim() || undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
      isActive:
        filters.status === 'all'
          ? undefined
          : filters.status === 'active'
            ? true
            : false
    }),
    [filters]
  );

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCategoryService.getCategories(normalizedFilters);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      message.error('Khong the tai danh muc');
    } finally {
      setLoading(false);
    }
  }, [normalizedFilters]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEditModal = async (categoryId: number) => {
    setModalMode('edit');
    setEditingId(categoryId);
    setModalOpen(true);
    setSubmitting(true);
    try {
      const detail = await adminCategoryService.getCategory(categoryId);
      form.setFieldsValue({
        name: detail.name,
        description: detail.description ?? '',
        type: detail.type ?? '',
        isActive: detail.isActive
      });
    } catch (error) {
      console.error('Failed to load category detail', error);
      message.error('Khong the tai thong tin danh muc');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCategory = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload: AdminCreateCategoryPayload = {
          name: values.name,
          description: values.description,
          type: values.type || undefined,
          isActive: values.isActive ?? true
        };
        await adminCategoryService.createCategory(payload);
        message.success('Da tao danh muc');
      } else if (editingId !== null) {
        const payload: AdminUpdateCategoryPayload = {
          name: values.name,
          description: values.description,
          type: values.type || undefined,
          isActive: values.isActive ?? true
        };
        await adminCategoryService.updateCategory(editingId, payload);
        message.success('Da cap nhat danh muc');
      }
      setModalOpen(false);
      form.resetFields();
      await fetchCategories();
    } catch (error) {
      console.error('Failed to submit category form', error);
      message.error('Khong the luu danh muc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (category: AdminCategory) => {
    try {
      await adminCategoryService.toggleActive(category.categoryId);
      message.success(
        category.isActive ? 'Da vo hieu hoa danh muc' : 'Da kich hoat danh muc'
      );
      await fetchCategories();
      if (selectedCategory?.categoryId === category.categoryId) {
        const detail = await adminCategoryService.getCategory(category.categoryId);
        setSelectedCategory(detail);
      }
    } catch (error) {
      console.error('Failed to toggle category', error);
      message.error('Khong the thay doi trang thai danh muc');
    }
  };

  const openDetail = async (categoryId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminCategoryService.getCategory(categoryId);
      setSelectedCategory(detail);
    } catch (error) {
      console.error('Failed to fetch category detail', error);
      message.error('Khong the tai chi tiet danh muc');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<AdminCategory> = [
    {
      title: 'Ten danh muc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          {record.description && <span className="text-xs text-gray-500">{record.description}</span>}
        </Space>
      )
    },
    {
      title: 'Loai',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (value?: string | null) => value ?? 'Chua xac dinh'
    },
    {
      title: 'Trang thai',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Dang ap dung' : 'Dang tat'}</Tag>
      )
    },
    {
      title: 'Tao luc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (value?: string | null) =>
        value
          ? new Date(value).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '---'
    },
    {
      title: 'Hanh dong',
      key: 'actions',
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.categoryId)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record.categoryId)}>
            Sua
          </Button>
          <Button
            icon={<PoweroffOutlined />}
            size="small"
            danger={record.isActive}
            type={record.isActive ? 'default' : 'primary'}
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? 'Vo hieu hoa' : 'Kich hoat'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card bordered={false} className="shadow-sm mb-4">
        <Space className="w-full flex justify-between" align="start">
          <Space direction="vertical" size={4}>
            <Title level={3} className="!mb-0">
              Quan ly danh muc
            </Title>
            <Paragraph className="!mb-0 text-gray-500">
              Cap nhat cac nhom nganh, linh vuc su dung trong tuyen dung va tim viec.
            </Paragraph>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchCategories()} loading={loading}>
              Tai lai
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tao danh muc
            </Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tim theo ten hoac mo ta..."
            allowClear
            value={filters.keyword}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
          />
          <Space wrap size="middle">
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: 220 }}
            >
              <Option value="all">Tat ca loai</Option>
              <Option value="Employer">Nha tuyen dung</Option>
              <Option value="JobSeeker">Ung vien</Option>
              <Option value="Skill">Ky nang</Option>
            </Select>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: 220 }}
            >
              <Option value="all">Tat ca trang thai</Option>
              <Option value="active">Dang ap dung</Option>
              <Option value="inactive">Dang tat</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="categoryId"
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Drawer
        title="Chi tiet danh muc"
        placement="right"
        width={420}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Dang tai...</p>
        ) : selectedCategory ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Ten">{selectedCategory.name}</Descriptions.Item>
            {selectedCategory.description && (
              <Descriptions.Item label="Mo ta">{selectedCategory.description}</Descriptions.Item>
            )}
            <Descriptions.Item label="Loai">
              {selectedCategory.type ?? 'Chua xac dinh'}
            </Descriptions.Item>
            <Descriptions.Item label="Trang thai">
              {selectedCategory.isActive ? 'Dang ap dung' : 'Dang tat'}
            </Descriptions.Item>
            <Descriptions.Item label="Tao luc">
              {selectedCategory.createdAt
                ? new Date(selectedCategory.createdAt).toLocaleString('vi-VN')
                : '---'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>

      <Modal
        title={modalMode === 'create' ? 'Tao danh muc' : 'Cap nhat danh muc'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        okText={modalMode === 'create' ? 'Tao moi' : 'Luu thay doi'}
        cancelText="Huy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item
            name="name"
            label="Ten danh muc"
            rules={[{ required: true, message: 'Vui long nhap ten danh muc' }]}
          >
            <Input placeholder="Nhap ten danh muc" />
          </Form.Item>

          <Form.Item name="type" label="Loai">
            <Select allowClear placeholder="Chon loai">
              <Option value="Employer">Nha tuyen dung</Option>
              <Option value="JobSeeker">Ung vien</Option>
              <Option value="Skill">Ky nang</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} placeholder="Mo ta ngan gon" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trang thai"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Dang ap dung" unCheckedChildren="Dang tat" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminCategoryManagementPage;
