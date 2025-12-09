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
  Divider,
  Modal,
  Tabs,
  Form,
  InputNumber,
  Popconfirm,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { TabsProps } from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  UserSwitchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import adminUserService from '../../features/admin/services/adminUser.service';
import adminEmployerRegistrationService from '../../features/admin/services/adminEmployerRegistration.service';
import type { AdminUser, AdminUserDetail } from '../../features/admin/types/user';
import adminPlanService from '../../features/admin/services/adminPlan.service';
import type { AdminSubscriptionHistory, AdminTransactionHistory, AdminPlan, AdminPlanPayload } from '../../features/admin/types/adminPlan';
import type {
  AdminEmployerRegListItem,
  AdminEmployerRegStatus,
  GoogleEmployerRegList,
} from '../../features/admin/types/employerRegistration';
import AdminSectionHeader from './components/AdminSectionHeader';

const { Option } = Select;
const { TextArea } = Input;

const getApiMessage = (error: unknown): string | undefined => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } } };
    return err.response?.data?.message;
  }
  return undefined;
};

type DetailFieldProps = {
  label: string;
  value?: React.ReactNode;
  span?: 1 | 2;
};

const DetailFieldBox: React.FC<DetailFieldProps> = ({ label, value, span = 1 }) => (
  <div className={`flex flex-col gap-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 min-h-[42px] flex items-center">
      {value ?? <span className="text-gray-400 italic">Chưa có dữ liệu</span>}
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

type RegFilterState = {
  status: 'All' | AdminEmployerRegStatus;
  keyword: string;
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—');

const roleOptions = [
  { label: 'Tất cả vai trò', value: 'all' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Employer', value: 'Employer' },
  { label: 'JobSeeker', value: 'JobSeeker' }
];

const AdminAccountManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'registrations' | 'google' | 'plans'>('accounts');
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
  const [regRequests, setRegRequests] = useState<AdminEmployerRegListItem[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regActionLoadingId, setRegActionLoadingId] = useState<number | null>(null);
  const [regFilters, setRegFilters] = useState<RegFilterState>({
    status: 'Pending',
    keyword: ''
  });
  const [regPagination, setRegPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
  });
  const [googleRegs, setGoogleRegs] = useState<GoogleEmployerRegList[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleActionLoadingId, setGoogleActionLoadingId] = useState<number | null>(null);
  const [subHistory, setSubHistory] = useState<AdminSubscriptionHistory[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<AdminTransactionHistory[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<{ id: number; name: string } | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [planListLoading, setPlanListLoading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [planForm] = Form.useForm<AdminPlanPayload>();

  const fetchPlans = useCallback(async () => {
    setPlanListLoading(true);
    try {
      const data = await adminPlanService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans', error);
      message.error('Khong the tai danh sach goi');
    } finally {
      setPlanListLoading(false);
    }
  }, []);

  const handleDeletePlan = useCallback(
    async (plan: AdminPlan) => {
      try {
        setPlanListLoading(true);
        await adminPlanService.deletePlan(plan.planId);
        message.success('Xoa goi thanh cong');
        await fetchPlans();
      } catch (error) {
        console.error('Delete plan error', error);
        message.error('Khong the xoa goi');
      } finally {
        setPlanListLoading(false);
      }
    },
    [fetchPlans]
  );

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
  }, [filters, pagination]);

  const normalizedRegFilters = useMemo(
    () => ({
      status: regFilters.status === 'All' ? undefined : regFilters.status,
      keyword: regFilters.keyword.trim() || undefined,
      page: regPagination.current,
      pageSize: regPagination.pageSize
    }),
    [regFilters, regPagination]
  );

  const openCreatePlanModal = useCallback(() => {
    setEditingPlan(null);
    planForm.resetFields();
    setPlanModalOpen(true);
  }, [planForm]);

  const openEditPlanModal = useCallback(
    (plan: AdminPlan) => {
      setEditingPlan(plan);
      planForm.setFieldsValue({
        planName: plan.planName,
        price: plan.price,
        maxPosts: plan.maxPosts,
        durationDays: plan.durationDays ?? null
      });
      setPlanModalOpen(true);
    },
    [planForm]
  );

  const handleSubmitPlan = useCallback(async () => {
    const values = await planForm.validateFields();
    try {
      setPlanListLoading(true);
      if (editingPlan) {
        await adminPlanService.updatePlan(editingPlan.planId, values);
        message.success('Cap nhat goi thanh cong');
      } else {
        await adminPlanService.createPlan(values);
        message.success('Tao goi thanh cong');
      }
      setPlanModalOpen(false);
      await fetchPlans();
    } catch (error) {
      console.error('Plan submit error', error);
      message.error('Khong the luu goi');
    } finally {
      setPlanListLoading(false);
    }
  }, [editingPlan, planForm, fetchPlans]);

  const subscriptionColumns: ColumnsType<AdminSubscriptionHistory> = useMemo(
    () => [
      {
        title: 'Goi',
        dataIndex: 'planName',
        key: 'planName',
        render: (_: string, record) => record.planName || `#${record.planId ?? ''}`
      },
      {
        title: 'Gia',
        dataIndex: 'price',
        key: 'price',
        render: (value?: number) => (typeof value === 'number' ? `${value.toLocaleString('vi-VN')} VND` : '-')
      },
      {
        title: 'Bai con',
        dataIndex: 'remainingPosts',
        key: 'remainingPosts',
        render: (value?: number) => (typeof value === 'number' ? value : '-')
      },
      {
        title: 'Trang thai',
        dataIndex: 'status',
        key: 'status',
        render: (status?: string) => {
          const color = status === 'Active' ? 'green' : status === 'Expired' ? 'red' : 'default';
          return <Tag color={color}>{status || '-'}</Tag>;
        }
      },
      { title: 'Bat dau', dataIndex: 'startDate', key: 'startDate', render: (value?: string) => formatDate(value) },
      { title: 'Ket thuc', dataIndex: 'endDate', key: 'endDate', render: (value?: string) => formatDate(value) }
    ],
    []
  );

  const transactionColumns: ColumnsType<AdminTransactionHistory> = useMemo(
    () => [
      {
        title: 'Giao dich',
        dataIndex: 'transactionId',
        key: 'transactionId',
        render: (value: number, record) => `#${value} | ${record.planName || `Plan ${record.planId ?? ''}`}`
      },
      {
        title: 'So tien',
        dataIndex: 'amount',
        key: 'amount',
        render: (value?: number) => (typeof value === 'number' ? `${value.toLocaleString('vi-VN')} VND` : '-')
      },
      {
        title: 'Trang thai',
        dataIndex: 'status',
        key: 'status',
        render: (status?: string) => {
          const color = status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'default';
          return <Tag color={color}>{status || '-'}</Tag>;
        }
      },
      { title: 'Ma order', dataIndex: 'payOsorderCode', key: 'payOsorderCode', render: (v?: string) => v || '-' },
      { title: 'Tao luc', dataIndex: 'createdAt', key: 'createdAt', render: (v?: string) => formatDate(v) },
      { title: 'Thanh toan', dataIndex: 'paidAt', key: 'paidAt', render: (v?: string) => formatDate(v) }
    ],
    []
  );

  const planColumns: ColumnsType<AdminPlan> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'planId', key: 'planId', width: 80 },
      { title: 'Tên gói', dataIndex: 'planName', key: 'planName' },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (value: number) => `${(value ?? 0).toLocaleString('vi-VN')} VND`
      },
      { title: 'Số bài', dataIndex: 'maxPosts', key: 'maxPosts', render: (v?: number) => (v ?? '-') },
      { title: 'Số ngày', dataIndex: 'durationDays', key: 'durationDays', render: (v?: number | null) => (v ?? '-') },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditPlanModal(record)}>
              Sửa
            </Button>
            <Popconfirm
              title="Xóa gói?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDeletePlan(record)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [openEditPlanModal, handleDeletePlan]
  );

  const fetchPlanAndTransactions = useCallback(
    async (userId: number) => {
      setPlanLoading(true);
      try {
        const [subs, trans] = await Promise.all([
          adminPlanService.getSubscriptionsByUser(userId),
          adminPlanService.getTransactionsByUser(userId)
        ]);
        setSubHistory(subs);
        setTransactionHistory(trans);
      } catch (error) {
        console.error('Failed to load plan/transactions', error);
        message.error('Khong the tai lich su goi/thanh toan.');
      } finally {
        setPlanLoading(false);
      }
    },
    []
  );

  const openDetail = async (userId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminUserService.getUserDetail(userId);
      setSelectedUser(detail);
      if (detail.role === 'Employer') {
        await fetchPlanAndTransactions(userId);
      } else {
        setSubHistory([]);
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch user detail', error);
      message.error('Không thể tải chi tiết tài khoản');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openHistoryFromList = async (user: AdminUser) => {
    const employerName = (user as AdminUserDetail)?.companyName || user.displayName || user.username;
    setHistoryUser({
      id: user.userId,
      name: employerName
    });
    setHistoryModalOpen(true);
    await fetchPlanAndTransactions(user.userId);
  };

  useEffect(() => {
    if (!historyModalOpen) {
      setHistoryUser(null);
    }
  }, [historyModalOpen]);

  const handleToggleActive = async (user: AdminUser) => {
    if (user.role === 'Admin') {
      message.warning('Admin không thể khóa/mở khóa tài khoản của mình.');
      return;
    }
    setToggleLoadingId(user.userId);
    try {
      await adminUserService.toggleActive(user.userId, { notify: false });
      message.success(
        `Đã ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${user.username}`
      );
    } catch (error) {
      console.error('Failed to toggle user active', error);
      const apiMessage = getApiMessage(error);
      if (apiMessage?.includes('AccountSuspended')) {
        message.warning(
          'Đã khóa tài khoản nhưng server thiếu template AccountSuspended. Trạng thái đã được cập nhật.'
        );
      } else {
        message.error(apiMessage ?? 'Không thể thay đổi trạng thái tài khoản');
        return;
      }
    } finally {
      await fetchUsers(currentPage, currentPageSize);
      if (selectedUser?.userId === user.userId) {
        const detail = await adminUserService.getUserDetail(user.userId);
        setSelectedUser(detail);
      }
      setToggleLoadingId(null);
    }
  };

  const handleApproveRegistration = async (request: AdminEmployerRegListItem) => {
    setRegActionLoadingId(request.requestId);
    try {
      await adminEmployerRegistrationService.approve(request.requestId);
      message.success(`Đã phê duyệt hồ sơ. Email xác thực đã được gửi tới ${request.email}.`);
      await Promise.all([fetchRegistrations(regPagination.current ?? 1, regPagination.pageSize ?? 10), fetchUsers(currentPage, currentPageSize)]);
    } catch (error) {
      console.error('Failed to approve employer registration', error);
      const apiMessage = getApiMessage(error);
      message.error(apiMessage ?? 'Không phê duyệt hồ sơ');
    } finally {
      setRegActionLoadingId(null);
    }
  };

  const handleRejectRegistration = (request: AdminEmployerRegListItem) => {
    let reason = '';
    Modal.confirm({
      title: 'Từ chối hồ sơ',
      content: (
        <TextArea
          autoSize={{ minRows: 3 }}
          placeholder="Nhập lý do từ chối"
          onChange={(e) => {
            reason = e.target.value;
          }}
        />
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        if (!reason.trim()) {
          message.warning('Vui lòng nhập lý do.');
          return Promise.reject();
        }
        setRegActionLoadingId(request.requestId);
        try {
          await adminEmployerRegistrationService.reject(request.requestId, reason.trim());
          message.success('Đã từ chối hồ sơ.');
          await fetchRegistrations(regPagination.current ?? 1, regPagination.pageSize ?? 10);
        } catch (error) {
          console.error('Failed to reject employer registration', error);
          const apiMessage = getApiMessage(error);
          message.error(apiMessage ?? 'Không từ chối được hồ sơ');
          return Promise.reject();
        } finally {
          setRegActionLoadingId(null);
        }
        return Promise.resolve();
      }
    });
  };

  const handleApproveGoogle = async (item: GoogleEmployerRegList) => {
    setGoogleActionLoadingId(item.id);
    try {
      await adminEmployerRegistrationService.approveGoogle(item.id);
      message.success('Đã duyệt hồ sơ Google NTD.');
      await Promise.all([fetchGoogleRegistrations(), fetchUsers(currentPage, currentPageSize)]);
    } catch (error) {
      console.error('Failed to approve Google employer registration', error);
      const apiMessage = getApiMessage(error);
      message.error(apiMessage ?? 'Không thể duyệt hồ sơ Google.');
    } finally {
      setGoogleActionLoadingId(null);
    }
  };

  const handleRejectGoogle = (item: GoogleEmployerRegList) => {
    let reason = '';
    Modal.confirm({
      title: 'Từ chối hồ sơ Google',
      content: (
        <TextArea
          autoSize={{ minRows: 3 }}
          placeholder="Nhập lý do từ chối"
          onChange={(e) => {
            reason = e.target.value;
          }}
        />
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, loading: googleActionLoadingId === item.id },
      async onOk() {
        if (!reason.trim()) {
          message.warning('Vui lòng nhập lý do.');
          return Promise.reject();
        }
        setGoogleActionLoadingId(item.id);
        try {
          await adminEmployerRegistrationService.rejectGoogle(item.id, reason.trim());
          message.success('Đã từ chối hồ sơ Google.');
          await fetchGoogleRegistrations();
        } catch (error) {
          console.error('Failed to reject Google employer registration', error);
          const apiMessage = getApiMessage(error);
          message.error(apiMessage ?? 'Không thể từ chối hồ sơ Google.');
          return Promise.reject();
        } finally {
          setGoogleActionLoadingId(null);
        }
        return Promise.resolve();
      }
    });
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Người dùng',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text || record.username}</span>
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
      width: 220,
      render: (_, record) => (
        <Space style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetail(record.userId)}
            style={{ minWidth: 90 }}
          >
            Chi tiết
          </Button>
          {record.role === 'Employer' && (
            <Button
              size="small"
              onClick={() => void openHistoryFromList(record)}
              loading={planLoading && historyModalOpen && historyUser?.id === record.userId}
              style={{ minWidth: 120 }}
            >
              Lịch sử giao dịch
            </Button>
          )}
          {record.role !== 'Admin' && (
            <Button
              icon={<UserSwitchOutlined />}
              size="small"
              danger={record.isActive}
              loading={toggleLoadingId === record.userId}
              onClick={() => handleToggleActive(record)}
              style={{ minWidth: 95 }}
            >
              {record.isActive ? 'Khóa' : 'Mở khóa'}
            </Button>
          )}
        </Space>
      )
    }
  ];


  const regColumns: ColumnsType<AdminEmployerRegListItem> = [
    {
      title: 'Tên nhà tuyển dụng',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{value}</span>
          <span className="text-gray-500 text-xs">{record.email}</span>
        </Space>
      )
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (value: string) => <span className="text-gray-700">{value}</span>
    },
    {
      title: 'SĐT liên hệ',
      dataIndex: 'contactPhone',
      key: 'contactPhone'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: AdminEmployerRegStatus) => {
        const color =
          value === 'Pending' ? 'orange' : value === 'Approved' ? 'green' : 'red';
        const label =
          value === 'Pending' ? 'Chờ duyệt' : value === 'Approved' ? 'Đã duyệt' : 'Đã từ chối';
        return <Tag color={color}>{label}</Tag>;
      },
      width: 140
    },
    {
      title: 'Gửi lúc',
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
      width: 190
    },
    {
      title: 'Hành động',
      key: 'regActions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            disabled={record.status !== 'Pending'}
            loading={regActionLoadingId === record.requestId}
            onClick={() => handleApproveRegistration(record)}
          >
            Phê duyệt
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== 'Pending'}
            loading={regActionLoadingId === record.requestId}
            onClick={() => handleRejectRegistration(record)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  const fetchUsers = useCallback(
    async (page: number, pageSize: number) => {
      setLoading(true);
      try {
        const response = await adminUserService.getUsers({
          ...normalizedFilters,
          page,
          pageSize
        });
        setUsers(response.items);
        setPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged =
            prev.current === next.current && prev.pageSize === next.pageSize && prev.total === next.total;
          return unchanged ? prev : next;
        });
      } catch (error) {
        console.error('Failed to load admin users', error);
        message.error('Khong the tai danh sach tai khoan');
      } finally {
        setLoading(false);
      }
    },
    [normalizedFilters]
  );

  const currentPage = pagination.current ?? 1;
  const currentPageSize = pagination.pageSize ?? 10;

  useEffect(() => {
    void fetchUsers(currentPage, currentPageSize);
  }, [fetchUsers, currentPage, currentPageSize]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    void fetchUsers(1, currentPageSize);
  };

  const handleRegFilterChange = (key: keyof RegFilterState, value: string) => {
    setRegFilters((prev) => ({ ...prev, [key]: value }));
    setRegPagination((prev) => ({ ...prev, current: 1 }));
  };

  const fetchRegistrations = useCallback(
    async (page: number, pageSize: number) => {
      setRegLoading(true);
      try {
        const response = await adminEmployerRegistrationService.getRequests({
          ...normalizedRegFilters,
          page,
          pageSize
        });
        setRegRequests(response.items);
        setRegPagination((prev) => {
          const next = { ...prev, current: page, pageSize, total: response.total };
          const unchanged =
            prev.current === next.current && prev.pageSize === next.pageSize && prev.total === next.total;
          return unchanged ? prev : next;
        });
      } catch (error) {
        console.error('Failed to load employer registrations', error);
        message.error('Khong the tai danh sach ho so cho duyet');
      } finally {
        setRegLoading(false);
      }
    },
    [normalizedRegFilters]
  );

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    if (newPagination.current && newPagination.pageSize) {
      void fetchUsers(newPagination.current, newPagination.pageSize);
    }
  };

  const handleRegTableChange = (newPagination: TablePaginationConfig) => {
    setRegPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    if (newPagination.current && newPagination.pageSize) {
      void fetchRegistrations(newPagination.current, newPagination.pageSize);
    }
  };

  useEffect(() => {
    if (activeTab === 'registrations' && regRequests.length === 0) {
      void fetchRegistrations(regPagination.current ?? 1, regPagination.pageSize ?? 10);
    }
  }, [activeTab, fetchRegistrations, regRequests.length, regPagination]);

  useEffect(() => {
    if (activeTab === 'accounts') {
      void fetchUsers(currentPage, currentPageSize);
    }
  }, [activeTab, fetchUsers, currentPage, currentPageSize]);

  const fetchGoogleRegistrations = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const data = await adminEmployerRegistrationService.getGoogleRequests();
      setGoogleRegs(data);
    } catch (error) {
      console.error('Failed to load google employer registrations', error);
      message.error('Khong the tai danh sach ho so Google NTD');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'google' && googleRegs.length === 0) {
      void fetchGoogleRegistrations();
    }
  }, [activeTab, fetchGoogleRegistrations, googleRegs.length]);

  useEffect(() => {
    if (activeTab === 'plans' && plans.length === 0) {
      void fetchPlans();
    }
  }, [activeTab, fetchPlans, plans.length]);

  const accountTabContent = (
    <>
      <Card
        variant="borderless"
        className="shadow-sm mb-4 border-0 bg-white/90 backdrop-blur-lg"
        styles={{ body: { padding: 20 } }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo email, username, địa chỉ..."
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

      <Card variant="borderless" className="shadow-sm">
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
    </>
  );

  const registrationTabContent = (
    <Card
      variant="borderless"
      className="shadow-sm border-0 bg-white/90 backdrop-blur-lg"
      styles={{ body: { padding: 20 } }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography.Title level={5} className="!mb-0">
              Duyệt đăng ký nhà tuyển dụng
            </Typography.Title>
            <Typography.Text type="secondary">
              Danh sách tài khoản employer chờ phê duyệt để chuyển sang người dùng chính thức.
            </Typography.Text>
          </div>
          <Space wrap>
            <Input
              allowClear
              placeholder="Tìm theo email, tên công ty..."
              prefix={<SearchOutlined />}
              value={regFilters.keyword}
              onChange={(e) => handleRegFilterChange('keyword', e.target.value)}
            />
            <Select
              value={regFilters.status}
              style={{ minWidth: 180 }}
              onChange={(value) => handleRegFilterChange('status', value)}
            >
              <Option value="All">Tất cả trạng thái</Option>
              <Option value="Pending">Chờ duyệt</Option>
              <Option value="Approved">Đã duyệt</Option>
              <Option value="Rejected">Đã từ chối</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchRegistrations(regPagination.current ?? 1, regPagination.pageSize ?? 10)} loading={regLoading}>
              Làm mới
            </Button>
          </Space>
        </div>
        <Table
          rowKey="requestId"
          loading={regLoading}
          dataSource={regRequests}
          columns={regColumns}
          pagination={regPagination}
          scroll={{ x: 900 }}
          onChange={handleRegTableChange}
        />
      </div>
    </Card>
  );

  const googleColumns: ColumnsType<GoogleEmployerRegList> = [
    {
      title: 'Tên hiển thị',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{value}</span>
          <span className="text-gray-500 text-xs">{record.email}</span>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: string) => (
        <Tag color={value === 'Pending' ? 'orange' : value === 'Approved' ? 'green' : 'red'}>
          {value === 'Pending' ? 'Chờ duyệt' : value === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
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
      title: 'Hành động',
      key: 'googleActions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            disabled={record.status !== 'Pending'}
            loading={googleActionLoadingId === record.id}
            onClick={() => handleApproveGoogle(record)}
          >
            Duyệt
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== 'Pending'}
            loading={googleActionLoadingId === record.id}
            onClick={() => handleRejectGoogle(record)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  const googleTabContent = (
    <Card
      variant="borderless"
      className="shadow-sm border-0 bg-white/90 backdrop-blur-lg"
      styles={{ body: { padding: 20 } }}
    >
      <Table
        rowKey="id"
        loading={googleLoading}
        dataSource={googleRegs}
        columns={googleColumns}
        pagination={false}
        scroll={{ x: 900 }}
      />
    </Card>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'accounts',
      label: 'Quản lý tài khoản',
      children: accountTabContent,
    },
    {
      key: 'registrations',
      label: 'Duyệt đăng ký nhà tuyển dụng',
      children: registrationTabContent,
    },
    {
      key: 'google',
      label: 'Duyệt Nhà tuyển dụng Google',
      children: googleTabContent,
    },
    {
      key: 'plans',
      label: 'Quản lý gói nâng cấp',
      children: (
        <>
          <Card
            title="Danh sách gói"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => void fetchPlans()} loading={planListLoading}>
                  Làm mới
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePlanModal}>
                  Thêm gói
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="planId"
              dataSource={plans}
              columns={planColumns}
              loading={planListLoading}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>

          <Modal
            title={editingPlan ? 'Cập nhật gói' : 'Thêm gói'}
            open={planModalOpen}
            onOk={handleSubmitPlan}
            onCancel={() => {
              setPlanModalOpen(false);
              setEditingPlan(null);
            }}
            confirmLoading={planListLoading}
            destroyOnClose
          >
            <Form layout="vertical" form={planForm} initialValues={{ price: 0, maxPosts: 0, durationDays: null }}>
              <Form.Item
                label="Tên gói"
                name="planName"
                rules={[{ required: true, message: 'Nhập tên gói' }]}
              >
                <Input placeholder="Nhập tên gói" />
              </Form.Item>
              <Form.Item
                label="Giá (VND)"
                name="price"
                rules={[{ required: true, message: 'Nhập giá gói' }]}
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  controls={false}
                  precision={0}
                />
              </Form.Item>
              <Form.Item label="Số bài" name="maxPosts">
                <InputNumber min={0} className="w-full" controls={false} />
              </Form.Item>
              <Form.Item label="Số ngày" name="durationDays">
                <InputNumber min={0} className="w-full" controls={false} />
              </Form.Item>
            </Form>
          </Modal>
        </>
      ),
    },
  ];
  return (
    <>
      <AdminSectionHeader
        title="Quản lý tài khoản"
        description="Giám sát trạng thái hoạt động, xác thực và thông tin người dùng trên hệ thống."
        gradient="from-sky-600 via-blue-500 to-indigo-500"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (activeTab === 'accounts') {
                void fetchUsers(currentPage, currentPageSize);
              } else if (activeTab === 'registrations') {
                void fetchRegistrations(regPagination.current ?? 1, regPagination.pageSize ?? 10);
              } else if (activeTab === 'plans') {
                void fetchPlans();
              } else {
                void fetchGoogleRegistrations();
              }
            }}
            loading={
              activeTab === 'accounts'
                ? loading
                : activeTab === 'registrations'
                ? regLoading
                : activeTab === 'plans'
                ? planListLoading
                : googleLoading
            }
          >
            Tải lại
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'accounts' | 'registrations' | 'google' | 'plans')}
        items={tabItems}
      />

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
            {(() => {
              const displayName =
                selectedUser.role === 'Employer'
                  ? selectedUser.companyName || selectedUser.displayName || selectedUser.username
                  : selectedUser.fullName || selectedUser.displayName || selectedUser.username;
              return (
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    size={96}
                    src={selectedUser.avatarUrl ?? undefined}
                    alt={displayName}
                    style={{ marginBottom: 12 }}
                  >
                    {displayName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    {displayName}
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
              );
            })()}
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
                  <DetailFieldBox
                    label="Tên nhà tuyển dụng"
                    value={selectedUser.companyName || undefined}
                  />
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
              <DetailFieldBox
                label="Địa chỉ đầy đủ"
                value={selectedUser.fullLocation || undefined}
                span={2}
              />
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

            {selectedUser.role === 'Employer' && (
              <section className="space-y-3">
                <Typography.Title level={5} className="!mb-1">
                  Lich su giao dich
                </Typography.Title>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => void openHistoryFromList(selectedUser)}
                  loading={planLoading}
                >
                  Xem lịch sử giao dịch
                </Button>
              </section>
            )}
          </Space>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Drawer
        title={`Lich su giao dich${historyUser?.name ? ` - ${historyUser.name}` : ''}`}
        width={820}
        placement="right"
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" className="w-full">
          <Card size="small" className="border border-slate-200 shadow-sm">
            <Typography.Title level={5} className="!mb-3">
              Lich su goi (subscription)
            </Typography.Title>
            <Table
              size="small"
              rowKey={(record) => record.subscriptionId}
              dataSource={subHistory}
              columns={subscriptionColumns}
              pagination={false}
              loading={planLoading}
              locale={{ emptyText: 'Chua co goi' }}
            />
          </Card>

          <Card size="small" className="border border-slate-200 shadow-sm">
            <Typography.Title level={5} className="!mb-3">
              Lich su thanh toan
            </Typography.Title>
            <Table
              size="small"
              rowKey={(record) => record.transactionId}
              dataSource={transactionHistory}
              columns={transactionColumns}
              pagination={false}
              loading={planLoading}
              locale={{ emptyText: 'Chua co giao dich' }}
            />
          </Card>
        </Space>
      </Drawer>
    </>
  );
};

export default AdminAccountManagementPage;
