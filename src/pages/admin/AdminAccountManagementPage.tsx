import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  message,
  Drawer,
  Avatar,
  Divider
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined, EyeOutlined, UserSwitchOutlined } from '@ant-design/icons';
import adminUserService from '../../features/admin/services/adminUser.service';
import type { AdminUser, AdminUserDetail } from '../../features/admin/types/user';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Option } = Select;

type DetailFieldProps = {
  label: string;
  value?: React.ReactNode;
  span?: 1 | 2;
};

const DetailFieldBox: React.FC<DetailFieldProps> = ({ label, value, span = 1 }) => (
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

type FilterState = {
  role: string;
  status: 'all' | 'active' | 'inactive';
  verified: 'all' | 'verified' | 'unverified';
  keyword: string;
};

const roleOptions = [
  { label: 'Tất cả vai trò', value: 'all' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Employer', value: 'Employer' },
  { label: 'JobSeeker', value: 'JobSeeker' }
];

const AdminAccountManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    role: 'all',
    status: 'all',
    verified: 'all',
    keyword: ''
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);

  const normalizedFilters = useMemo(() => {
    const statusMap: Record<FilterState['status'], boolean | undefined> = {
      all: undefined,
      active: true,
      inactive: false
    };
    const verifiedMap: Record<FilterState['verified'], boolean | undefined> = {
      all: undefined,
      verified: true,
      unverified: false
    };

    return {
      role: filters.role !== 'all' ? filters.role : undefined,
      isActive: statusMap[filters.status],
      isVerified: verifiedMap[filters.verified],
      keyword: filters.keyword.trim() || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize
    };
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchUsers = useCallback(
    async (page = pagination.current ?? 1, pageSize = pagination.pageSize ?? 10) => {
      setLoading(true);
      try {
        const response = await adminUserService.getUsers({
          ...normalizedFilters,
          page,
          pageSize
        });
        setUsers(response.items);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.total
        }));
      } catch (error) {
        console.error('Failed to load admin users', error);
        message.error('Không thể tải danh sách tài khoản');
      } finally {
        setLoading(false);
      }
    },
    [normalizedFilters, pagination.current, pagination.pageSize]
  );

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    void fetchUsers(newPagination.current, newPagination.pageSize);
  };

  const openDetail = async (userId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminUserService.getUserDetail(userId);
      setSelectedUser(detail);
    } catch (error) {
      console.error('Failed to fetch user detail', error);
      message.error('Không thể tải chi tiết tài khoản');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setToggleLoadingId(user.userId);
    try {
      await adminUserService.toggleActive(user.userId);
      message.success(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.username}`);
      await fetchUsers();
      if (selectedUser?.userId === user.userId) {
        const detail = await adminUserService.getUserDetail(user.userId);
        setSelectedUser(detail);
      }
    } catch (error) {
      console.error('Failed to toggle user active', error);
      message.error('Không thể thay đổi trạng thái tài khoản');
    } finally {
      setToggleLoadingId(null);
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-gray-500 text-xs">{record.email}</span>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (value: string) => <Tag color="blue">{value}</Tag>,
      width: 120
    },
    {
      title: 'Xác thực',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Đã xác thực' : 'Chưa xác thực'}</Tag>
      ),
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'orange'}>{value ? 'Đang hoạt động' : 'Bị khóa'}</Tag>
      ),
      width: 140
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      width: 200
    },
    {
      title: 'Lần đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (value: string | null | undefined) =>
        value
          ? new Date(value).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Chưa có',
      width: 200
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetail(record.userId)}
          >
            Chi tiết
          </Button>
          <Button
            icon={<UserSwitchOutlined />}
            size="small"
            danger={record.isActive}
            loading={toggleLoadingId === record.userId}
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <AdminSectionHeader
        title="Quản lý tài khoản"
        description="Giám sát trạng thái hoạt động, xác thực và thông tin người dùng trên hệ thống."
        gradient="from-sky-600 via-blue-500 to-indigo-500"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()} loading={loading} ghost>
            Tải lại
          </Button>
        }
      />

      <Card
        bordered={false}
        className="shadow-sm mb-4 border-0 bg-white/90 backdrop-blur-lg"
        bodyStyle={{ padding: 20 }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo email, username, số điện thoại..."
            allowClear
            value={filters.keyword}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
          />
          <Space size="middle" wrap>
            <Select
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              style={{ minWidth: 180 }}
            >
              {roleOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ minWidth: 180 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Bị khóa</Option>
            </Select>
            <Select
              value={filters.verified}
              onChange={(value) => handleFilterChange('verified', value)}
              style={{ minWidth: 200 }}
            >
              <Option value="all">Tất cả xác thực</Option>
              <Option value="verified">Đã xác thực</Option>
              <Option value="unverified">Chưa xác thực</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="userId"
          loading={loading}
          dataSource={users}
          columns={columns}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1100, y: 'calc(100vh - 320px)' }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title="Chi tiết tài khoản"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : selectedUser ? (
          <Space direction="vertical" size="large" className="w-full">
            <div className="flex flex-col items-center text-center">
              <Avatar
                size={96}
                src={selectedUser.avatarUrl ?? undefined}
                alt={selectedUser.username}
                style={{ marginBottom: 12 }}
              >
                {selectedUser.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                {selectedUser.username}
              </Typography.Title>
              <Typography.Text type="secondary">{selectedUser.email}</Typography.Text>
              <Space style={{ marginTop: 8 }}>
                <Tag color="purple">{selectedUser.role}</Tag>
                <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                  {selectedUser.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                </Tag>
                <Tag color={selectedUser.isVerified ? 'blue' : 'orange'}>
                  {selectedUser.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
              </Space>
            </div>

            <Divider plain>Thông tin chi tiết</Divider>

            <DetailSection title="Thông tin tài khoản">
              <DetailFieldBox label="Tên đăng nhập" value={selectedUser.username} />
              <DetailFieldBox label="Email" value={selectedUser.email} />
            </DetailSection>

            <DetailSection
              title={selectedUser.role === 'Employer' ? 'Thông tin nhà tuyển dụng' : 'Thông tin ứng viên'}
            >
              {selectedUser.role === 'Employer' ? (
                <>
                  <DetailFieldBox label="Tên nhà tuyển dụng" value={selectedUser.companyName || undefined} />
                  <DetailFieldBox label="Website" value={selectedUser.website || undefined} />
                  <DetailFieldBox
                    label="Số điện thoại liên hệ"
                    value={selectedUser.contactPhone || undefined}
                  />
                </>
              ) : (
                <>
                  <DetailFieldBox label="Họ tên" value={selectedUser.fullName || undefined} />
                  <DetailFieldBox label="Giới tính" value={selectedUser.gender || undefined} />
                  <DetailFieldBox
                    label="Năm sinh"
                    value={selectedUser.birthYear ? selectedUser.birthYear.toString() : undefined}
                  />
                  <DetailFieldBox
                    label="Số điện thoại"
                    value={selectedUser.contactPhone || undefined}
                  />
                </>
              )}
            </DetailSection>

            <DetailSection title="Địa chỉ">
              <DetailFieldBox label="Địa chỉ đầy đủ" value={selectedUser.fullLocation || undefined} span={2} />
              <DetailFieldBox label="Tỉnh / Thành phố" value={selectedUser.provinceName || undefined} />
              <DetailFieldBox label="Quận / Huyện" value={selectedUser.districtName || undefined} />
              <DetailFieldBox label="Phường / Xã" value={selectedUser.wardName || undefined} />
            </DetailSection>

            <DetailSection title="Hoạt động tài khoản">
              <DetailFieldBox
                label="Tài khoản tạo lúc"
                value={new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
              />
              <DetailFieldBox
                label="Lần đăng nhập cuối"
                value={
                  selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN')
                    : undefined
                }
              />
            </DetailSection>
          </Space>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>
    </>
  );
};

export default AdminAccountManagementPage;
