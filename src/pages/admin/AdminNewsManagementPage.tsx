import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Space,
  Tag,
  Button,
  Input,
  Select,
  message,
  Drawer,
  Modal,
  Form,
  InputNumber,
  Switch
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EyeOutlined, EditOutlined, BulbOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import adminNewsService from '../../features/admin/services/adminNews.service';
import type {
  AdminNews,
  AdminNewsDetail,
  AdminCreateNewsPayload,
  AdminUpdateNewsPayload,
  AdminNewsStatusFilter
} from '../../features/admin/types/news';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Option } = Select;

type FilterState = {
  keyword: string;
  status: AdminNewsStatusFilter;
};

interface NewsFormValues {
  title: string;
  content: string;
  category?: string;
  isFeatured: boolean;
  priority: number;
  isPublished: boolean;
}

const statusOptions: Array<{ label: string; value: AdminNewsStatusFilter }> = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Đã đăng', value: 'published' },
  { label: 'Bản nháp', value: 'unpublished' }
];

type DetailFieldProps = {
  label: string;
  value?: React.ReactNode;
  span?: 1 | 2;
};

const DetailField: React.FC<DetailFieldProps> = ({ label, value, span = 1 }) => (
  <div className={`flex flex-col gap-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-[42px] flex items-center">
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

const AdminNewsManagementPage: React.FC = () => {
  const [news, setNews] = useState<AdminNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all'
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<AdminNewsDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm<NewsFormValues>();
  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedFilters = useMemo(() => {
    const normalized: { isPublished?: boolean; keyword?: string } = {};
    if (filters.status === 'published') {
      normalized.isPublished = true;
    }
    if (filters.status === 'unpublished') {
      normalized.isPublished = false;
    }
    if (filters.keyword.trim()) {
      normalized.keyword = filters.keyword.trim();
    }
    return normalized;
  }, [filters]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminNewsService.getNews(normalizedFilters);
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news', error);
      message.error('Không thể tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  }, [normalizedFilters]);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCoverImageFile(file);
  };

  const resetCoverImage = () => {
    setCoverImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openDetail = async (newsId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminNewsService.getNewsDetail(newsId);
      setSelectedNews(detail);
    } catch (error) {
      console.error('Failed to load news detail', error);
      message.error('Không thể tải chi tiết tin tức');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      isFeatured: false,
      priority: 0,
      isPublished: false
    });
    resetCoverImage();
    setModalOpen(true);
  };

  const openEditModal = async (newsId: number) => {
    setModalMode('edit');
    setEditingId(newsId);
    setModalOpen(true);
    setSubmitting(true);
    resetCoverImage();
    try {
      const detail = await adminNewsService.getNewsDetail(newsId);
      form.setFieldsValue({
        title: detail.title,
        content: detail.content ?? '',
        category: detail.category ?? '',
        isFeatured: detail.isFeatured ?? false,
        priority: detail.priority ?? 0,
        isPublished: detail.isPublished
      });
    } catch (error) {
      console.error('Failed to load news detail for editing', error);
      message.error('Không thể tải thông tin tin tức');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNews = async (values: NewsFormValues) => {
    setSubmitting(true);
    const priorityValue = typeof values.priority === 'number' ? values.priority : 0;
    const categoryValue = values.category?.trim() || undefined;
    try {
      if (modalMode === 'create') {
        const payload: AdminCreateNewsPayload = {
          title: values.title.trim(),
          content: values.content,
          category: categoryValue,
          isFeatured: values.isFeatured,
          priority: priorityValue,
          isPublished: values.isPublished,
          coverImage: coverImageFile ?? undefined
        };
        await adminNewsService.createNews(payload);
        message.success('Đã tạo tin tức mới');
      } else if (editingId !== null) {
        const payload: AdminUpdateNewsPayload = {
          title: values.title.trim(),
          content: values.content,
          category: categoryValue,
          isFeatured: values.isFeatured,
          priority: priorityValue,
          isPublished: values.isPublished,
          coverImage: coverImageFile ?? undefined
        };
        await adminNewsService.updateNews(editingId, payload);
        message.success('Đã cập nhật tin tức');
        if (selectedNews?.newsId === editingId) {
          const detail = await adminNewsService.getNewsDetail(editingId);
          setSelectedNews(detail);
        }
      }
      setModalOpen(false);
      form.resetFields();
      resetCoverImage();
      await fetchNews();
    } catch (error) {
      console.error('Failed to submit news form', error);
      message.error('Không thể lưu tin tức');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (newsItem: AdminNews) => {
    setToggleLoadingId(newsItem.newsId);
    try {
      await adminNewsService.togglePublish(newsItem.newsId);
      message.success('Đã thay đổi trạng thái xuất bản');
      await fetchNews();
      if (selectedNews?.newsId === newsItem.newsId) {
        const detail = await adminNewsService.getNewsDetail(newsItem.newsId);
        setSelectedNews(detail);
      }
    } catch (error) {
      console.error('Failed to toggle news status', error);
      message.error('Không thể thay đổi trạng thái xuất bản');
    } finally {
      setToggleLoadingId(null);
    }
  };

  const columns: ColumnsType<AdminNews> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          {record.category && <span className="text-xs text-gray-500">{record.category}</span>}
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 140,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'orange'}>{value ? 'Đã đăng' : 'Bản nháp'}</Tag>
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
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
          : 'Chưa cập nhật'
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(record.newsId)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record.newsId)}>
            Sua
          </Button>
          <Button
            icon={<BulbOutlined />}
            size="small"
            type={record.isPublished ? 'default' : 'primary'}
            danger={record.isPublished}
            loading={toggleLoadingId === record.newsId}
            onClick={() => handleTogglePublish(record)}
          >
            {record.isPublished ? 'Bỏ đăng' : 'Đăng tin'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <AdminSectionHeader
        title="Quản lý tin tức"
        description="Tạo mới, cập nhật và theo dõi trạng thái tin tức hệ thống."
        gradient="from-amber-500 via-orange-500 to-yellow-500"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchNews()} loading={loading}>
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tạo tin tức
            </Button>
          </Space>
        }
      />

      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            allowClear
            value={filters.keyword}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
          />
          <Select
            value={filters.status}
            onChange={(value: AdminNewsStatusFilter) => handleFilterChange('status', value)}
            style={{ width: 220 }}
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="newsId"
          loading={loading}
          columns={columns}
          dataSource={news}
          pagination={false}
          scroll={{ x: 960 }}
        />
      </Card>

      <Drawer
        title="Chi tiet tin tuc"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Dang tai...</p>
        ) : selectedNews ? (
          <div className="space-y-6">
            <DetailSection title="Thong tin chung">
              <DetailField label="Tiêu đề" value={selectedNews.title} span={2} />
              <DetailField label="Chuyên mục" value={selectedNews.category || undefined} />
              <DetailField
                label="Trạng thái"
                value={selectedNews.isPublished ? 'Đã đăng' : 'Bản nháp'}
              />
              <DetailField label="Nổi bật" value={selectedNews.isFeatured ? 'Có' : 'Không'} />
              <DetailField label="Độ ưu tiên" value={selectedNews.priority} />
              <DetailField
                label="Tạo lúc"
                value={new Date(selectedNews.createdAt).toLocaleString('vi-VN')}
              />
              <DetailField
                label="Cập nhật"
                value={
                  selectedNews.updatedAt
                    ? new Date(selectedNews.updatedAt).toLocaleString('vi-VN')
                    : undefined
                }
              />
              <DetailField
                label="Quản trị viên"
                value={selectedNews.adminEmail ?? selectedNews.adminId}
              />
            </DetailSection>

            {selectedNews.imageUrl && (
              <section className="space-y-3">
                <Typography.Title level={5} className="!mb-1">
                  Ảnh minh họa
                </Typography.Title>
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                  <img
                    src={selectedNews.imageUrl}
                    alt={selectedNews.title}
                    className="mx-auto max-h-64 rounded-xl object-contain"
                  />
                </div>
              </section>
            )}

            {selectedNews.content && (
              <section className="space-y-3">
                <Typography.Title level={5} className="!mb-1">
                  Nội dung
                </Typography.Title>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="whitespace-pre-line leading-relaxed text-gray-800">
                    {selectedNews.content}
                  </p>
                </div>
              </section>
            )}
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Modal
        title={modalMode === 'create' ? 'Tạo tin tức' : 'Cập nhật tin tức'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          resetCoverImage();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNews}
          initialValues={{ isFeatured: false, isPublished: false, priority: 0 }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề tin tức" />
          </Form.Item>

          <Form.Item name="category" label="Chuyên mục">
            <Input placeholder="Ví dụ: Thông báo, Sự kiện..." />
          </Form.Item>

          <Form.Item label="Ảnh bìa (tải lên)">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="block w-full text-sm text-gray-600"
            />
            <Typography.Text type="secondary">
              Bỏ qua nếu muốn giữ nguyên hình hiện tại.
            </Typography.Text>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={4} placeholder="Nội dung chi tiết" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng nhập độ ưu tiên' }]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item name="isFeatured" label="Đánh dấu nổi bật" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isPublished" label="Trạng thái xuất bản" valuePropName="checked">
            <Switch checkedChildren="Đã đăng" unCheckedChildren="Bản nháp" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminNewsManagementPage;
