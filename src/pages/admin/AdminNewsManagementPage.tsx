import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Descriptions,
  Modal,
  Form
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import adminNewsService from '../../features/admin/services/adminNews.service';
import type {
  AdminNews,
  AdminNewsDetail,
  AdminCreateNewsPayload,
  AdminUpdateNewsPayload,
  AdminNewsStatusFilter
} from '../../features/admin/types/news';

const { Title, Paragraph } = Typography;
const { Option } = Select;

type FilterState = {
  keyword: string;
  status: AdminNewsStatusFilter;
};

interface NewsFormValues {
  title: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  status?: string;
}

const statusOptions: Array<{ label: string; value: AdminNewsStatusFilter }> = [
  { label: 'Tat ca trang thai', value: 'all' },
  { label: 'Dang hien thi', value: 'Active' },
  { label: 'Dang an', value: 'Hidden' }
];

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

  const normalizedFilters = useMemo(
    () => ({
      status: filters.status !== 'all' ? filters.status : undefined,
      keyword: filters.keyword.trim() || undefined
    }),
    [filters]
  );

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminNewsService.getNews(normalizedFilters);
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news', error);
      message.error('Khong the tai danh sach tin tuc');
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

  const openDetail = async (newsId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminNewsService.getNewsDetail(newsId);
      setSelectedNews(detail);
    } catch (error) {
      console.error('Failed to load news detail', error);
      message.error('Khong the tai chi tiet tin tuc');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = async (newsId: number) => {
    setModalMode('edit');
    setEditingId(newsId);
    setModalOpen(true);
    setSubmitting(true);
    try {
      const detail = await adminNewsService.getNewsDetail(newsId);
      form.setFieldsValue({
        title: detail.title,
        content: detail.content ?? '',
        imageUrl: detail.imageUrl ?? '',
        category: detail.category ?? '',
        status: detail.status ?? 'Active'
      });
    } catch (error) {
      console.error('Failed to load news detail for editing', error);
      message.error('Khong the tai thong tin tin tuc');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNews = async (values: NewsFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload: AdminCreateNewsPayload = {
          title: values.title,
          content: values.content,
          imageUrl: values.imageUrl,
          category: values.category
        };
        await adminNewsService.createNews(payload);
        message.success('Da tao tin tuc moi');
      } else if (editingId !== null) {
        const payload: AdminUpdateNewsPayload = {
          title: values.title,
          content: values.content,
          imageUrl: values.imageUrl,
          category: values.category,
          status: values.status
        };
        await adminNewsService.updateNews(editingId, payload);
        message.success('Da cap nhat tin tuc');
      }
      setModalOpen(false);
      form.resetFields();
      await fetchNews();
    } catch (error) {
      console.error('Failed to submit news form', error);
      message.error('Khong the luu tin tuc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (newsItem: AdminNews) => {
    setToggleLoadingId(newsItem.newsId);
    try {
      await adminNewsService.toggleActive(newsItem.newsId);
      message.success('Da thay doi trang thai tin tuc');
      await fetchNews();
      if (selectedNews?.newsId === newsItem.newsId) {
        const detail = await adminNewsService.getNewsDetail(newsItem.newsId);
        setSelectedNews(detail);
      }
    } catch (error) {
      console.error('Failed to toggle news status', error);
      message.error('Khong the thay doi trang thai');
    } finally {
      setToggleLoadingId(null);
    }
  };

  const columns: ColumnsType<AdminNews> = [
    {
      title: 'Tieu de',
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
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value?: string | null) => {
        const isActive = value !== 'Hidden';
        return <Tag color={isActive ? 'green' : 'orange'}>{isActive ? 'Dang hien thi' : 'Dang an'}</Tag>;
      }
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
      title: 'Cap nhat',
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
          : 'Chua cap nhat'
    },
    {
      title: 'Hanh dong',
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
            type={record.status === 'Hidden' ? 'primary' : 'default'}
            danger={record.status !== 'Hidden'}
            loading={toggleLoadingId === record.newsId}
            onClick={() => handleToggleActive(record)}
          >
            {record.status === 'Hidden' ? 'Hien thi' : 'An tin'}
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
              Quan ly tin tuc
            </Title>
            <Paragraph className="!mb-0 text-gray-500">
              Tao moi, cap nhat va theo doi trang thai tin tuc he thong.
            </Paragraph>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchNews()} loading={loading}>
              Tai lai
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tao tin tuc
            </Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tim theo tieu de hoac noi dung..."
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
        width={480}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Dang tai...</p>
        ) : selectedNews ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tieu de">{selectedNews.title}</Descriptions.Item>
            {selectedNews.category && (
              <Descriptions.Item label="Chuyen muc">{selectedNews.category}</Descriptions.Item>
            )}
            <Descriptions.Item label="Trang thai">
              {selectedNews.status === 'Hidden' ? 'Dang an' : 'Dang hien thi'}
            </Descriptions.Item>
            {selectedNews.imageUrl && (
              <Descriptions.Item label="Anh minh hoa">{selectedNews.imageUrl}</Descriptions.Item>
            )}
            {selectedNews.content && (
              <Descriptions.Item label="Noi dung">
                <div className="whitespace-pre-line">{selectedNews.content}</div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tao luc">
              {new Date(selectedNews.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cap nhat">
              {selectedNews.updatedAt
                ? new Date(selectedNews.updatedAt).toLocaleString('vi-VN')
                : 'Chua cap nhat'}
            </Descriptions.Item>
            <Descriptions.Item label="Quan tri vien">
              {selectedNews.adminEmail ?? selectedNews.adminId}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>

      <Modal
        title={modalMode === 'create' ? 'Tao tin tuc' : 'Cap nhat tin tuc'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        okText={modalMode === 'create' ? 'Tao moi' : 'Luu thay doi'}
        cancelText="Huy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitNews}>
          <Form.Item
            name="title"
            label="Tieu de"
            rules={[{ required: true, message: 'Vui long nhap tieu de' }]}
          >
            <Input placeholder="Nhap tieu de tin tuc" />
          </Form.Item>

          <Form.Item name="category" label="Chuyen muc">
            <Input placeholder="Vi du: Thong bao, Su kien..." />
          </Form.Item>

          <Form.Item name="imageUrl" label="Anh minh hoa">
            <Input placeholder="Lien ket anh" />
          </Form.Item>

          <Form.Item name="content" label="Noi dung">
            <Input.TextArea rows={4} placeholder="Noi dung chi tiet" />
          </Form.Item>

          {modalMode === 'edit' && (
            <Form.Item name="status" label="Trang thai">
              <Select>
                <Option value="Active">Dang hien thi</Option>
                <Option value="Hidden">Dang an</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default AdminNewsManagementPage;
