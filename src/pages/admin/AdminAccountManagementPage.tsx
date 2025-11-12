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
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
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
      {value ?? <span className="text-gray-400 italic">Chua cap nhat</span>}
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
  { label: 'Tat ca vai tro', value: 'all' },
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
        message.error('Khong the tai danh sach tai khoan');
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
  };

  const openDetail = async (userId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminUserService.getUserDetail(userId);
      setSelectedUser(detail);
    } catch (error) {
      console.error('Failed to fetch user detail', error);
      message.error('Khong the tai chi tiet tai khoan');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setToggleLoadingId(user.userId);
    try {
      await adminUserService.toggleActive(user.userId);
      message.success(
        `Da ${user.isActive ? 'vo hieu hoa' : 'kich hoat'} tai khoan ${user.username}`
      );
      await fetchUsers();
      if (selectedUser?.userId === user.userId) {
        const detail = await adminUserService.getUserDetail(user.userId);
        setSelectedUser(detail);
      }
    } catch (error) {
      console.error('Failed to toggle user active', error);
      message.error('Khong the thay doi trang thai tai khoan');
    } finally {
      setToggleLoadingId(null);
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Nguoi dung',
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
      title: 'Vai tro',
      dataIndex: 'role',
      key: 'role',
      render: (value: string) => <Tag color="blue">{value}</Tag>,
      width: 120
    },
    {
      title: 'Xac thuc',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Da xac thuc' : 'Chua xac thuc'}</Tag>
      ),
      width: 150
    },
    {
      title: 'Trang thai',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'orange'}>{value ? 'Dang hoat dong' : 'Bi khoa'}</Tag>
      ),
      width: 140
    },
    {
      title: 'Tao luc',
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
      title: 'Lan dang nhap cuoi',
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
          : 'Chua co',
      width: 200
    },
    {
      title: 'Hanh dong',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetail(record.userId)}
          >
            Chi tiet
          </Button>
          <Button
            icon={<UserSwitchOutlined />}
            size="small"
            danger={record.isActive}
            loading={toggleLoadingId === record.userId}
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? 'KhoA' : 'Mo Khoa'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <AdminSectionHeader
        title="Quan ly tai khoan"
        description="Giam sat trang thai hoat dong, xac thuc va thong tin nguoi dung tren he thong."
        gradient="from-sky-600 via-blue-500 to-indigo-500"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()} loading={loading} ghost>
            Tai lai
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
            placeholder="Tim theo email, username, dia chi..."
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
              <Option value="all">Tat ca trang thai</Option>
              <Option value="active">Dang hoat dong</Option>
              <Option value="inactive">Bi khoa</Option>
            </Select>
            <Select
              value={filters.verified}
              onChange={(value) => handleFilterChange('verified', value)}
              style={{ minWidth: 200 }}
            >
              <Option value="all">Tat ca xac thuc</Option>
              <Option value="verified">Da xac thuc</Option>
              <Option value="unverified">Chua xac thuc</Option>
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
          pagination={pagination}
          scroll={{ x: 1000 }}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title="Chi tiet tai khoan"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Dang tai...</p>
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
                  {selectedUser.isActive ? 'Dang hoat dong' : 'Bi khoa'}
                </Tag>
                <Tag color={selectedUser.isVerified ? 'blue' : 'orange'}>
                  {selectedUser.isVerified ? 'Da xac thuc' : 'Chua xac thuc'}
                </Tag>
              </Space>
            </div>

            <Divider plain>Thong tin chi tiet</Divider>

            <DetailSection title="Thong tin lien he">
              <DetailFieldBox label="Ho ten" value={selectedUser.fullName || undefined} />
              <DetailFieldBox label="Email" value={selectedUser.email} />
              <DetailFieldBox label="So dien thoai" value={selectedUser.phoneNumber || undefined} />
              <DetailFieldBox label="Dia chi" value={selectedUser.address || undefined} span={2} />
            </DetailSection>

            <DetailSection title="Thong tin khac">
              <DetailFieldBox label="Cong ty" value={selectedUser.companyName || undefined} />
              <DetailFieldBox
                label="Noi mong muon"
                value={selectedUser.preferredLocation || undefined}
              />
            </DetailSection>

            <DetailSection title="Hoat dong tai khoan">
              <DetailFieldBox
                label="Trang thai"
                value={selectedUser.isActive ? 'Dang hoat dong' : 'Bi khoa'}
              />
              <DetailFieldBox
                label="Xac thuc"
                value={selectedUser.isVerified ? 'Da xac thuc' : 'Chua xac thuc'}
              />
              <DetailFieldBox
                label="Tai khoan tao luc"
                value={new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
              />
              <DetailFieldBox
                label="Lan dang nhap cuoi"
                value={
                  selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN')
                    : undefined
                }
              />
            </DetailSection>
          </Space>
        ) : (
          <p>Khong co du lieu.</p>
        )}
      </Drawer>
    </>
  );
};

export default AdminAccountManagementPage;
