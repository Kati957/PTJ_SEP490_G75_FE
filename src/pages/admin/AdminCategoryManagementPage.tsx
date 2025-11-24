import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
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
import { ReloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import adminCategoryService from '../../features/admin/services/adminCategory.service';
import type {
  AdminCategory,
  AdminCategoryDetail,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload,
  AdminCategoryFilters
} from '../../features/admin/types/category';
import AdminSectionHeader from './components/AdminSectionHeader';

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

const normalizeVietnamese = (text?: string | null) =>
  text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

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

  const normalizedFilters = useMemo<AdminCategoryFilters>(() => {
    const trimmedKeyword = filters.keyword.trim();
    const normalized = normalizeVietnamese(trimmedKeyword);
    const hasDiacritics = trimmedKeyword !== '' && normalized !== trimmedKeyword.toLowerCase();

    return {
      keyword: hasDiacritics ? trimmedKeyword : undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
      isActive:
        filters.status === 'all'
          ? undefined
          : filters.status === 'active'
            ? true
            : false
    };
  }, [filters.keyword, filters.status, filters.type]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCategoryService.getCategories(normalizedFilters);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, [normalizedFilters]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const categoryTypes = useMemo(() => {
    const typeSet = new Set(
      categories
        .map((category) => category.type?.trim())
        .filter((type): type is string => Boolean(type))
    );
    return Array.from(typeSet).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [categories]);

  const displayedCategories = useMemo(() => {
    const keyword = filters.keyword.trim();
    if (!keyword) {
      return categories;
    }
    const normalizedKeyword = normalizeVietnamese(keyword);
    return categories.filter((category) => {
      const normalizedName = normalizeVietnamese(category.name);
      const normalizedDescription = normalizeVietnamese(category.description);
      return (
        normalizedName.includes(normalizedKeyword) || normalizedDescription.includes(normalizedKeyword)
      );
    });
  }, [categories, filters.keyword]);

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
        message.success('Đã tạo danh mục');
      } else if (editingId !== null) {
        const payload: AdminUpdateCategoryPayload = {
          name: values.name,
          description: values.description,
          type: values.type || undefined,
          isActive: values.isActive ?? true
        };
        await adminCategoryService.updateCategory(editingId, payload);
        message.success('Đã cập nhật danh mục');
      }
      setModalOpen(false);
      form.resetFields();
      await fetchCategories();
    } catch (error) {
      console.error('Failed to submit category form', error);
      message.error('Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
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
      message.error('Không thể tải chi tiết danh mục');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<AdminCategory> = [
    {
      title: 'Tên danh mục',
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
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (value?: string | null) => value ?? 'Chưa xác định'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Đang áp dụng' : 'Đang tắt'}</Tag>
      )
    }
  ];

  return (
    <>
      <AdminSectionHeader
        title="Quản lý danh mục ngành nghề"
        description="Cập nhật các nhóm ngành, lĩnh vực sử dụng trong tuyển dụng và tìm việc."
        gradient="from-emerald-500 via-teal-500 to-green-500"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchCategories()} loading={loading}>
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tạo danh mục
            </Button>
          </Space>
        }
      />

      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc mô tả..."
            allowClear
            value={filters.keyword}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
          />
          <Space wrap size="middle">
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: 220 }}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả loại</Option>
              {categoryTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: 220 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang áp dụng</Option>
              <Option value="inactive">Đang tắt</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="categoryId"
          loading={loading}
          columns={columns}
          dataSource={displayedCategories}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => openDetail(record.categoryId),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      <Drawer
        title="Chi tiết danh mục"
        placement="right"
        width={420}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : selectedCategory ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên">{selectedCategory.name}</Descriptions.Item>
            {selectedCategory.description && (
              <Descriptions.Item label="Mô tả">{selectedCategory.description}</Descriptions.Item>
            )}
            <Descriptions.Item label="Loại">
              {selectedCategory.type ?? 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedCategory.isActive ? 'Đang áp dụng' : 'Đang tắt'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Modal
        title={modalMode === 'create' ? 'Tạo danh mục' : 'Cập nhật danh mục'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item name="type" label="Loại">
            <Select
              allowClear
              placeholder="Chọn loại"
              showSearch
              optionFilterProp="children"
              notFoundContent="Chưa có loại nào"
            >
              {categoryTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn" />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Đang áp dụng" unCheckedChildren="Đang tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminCategoryManagementPage;
