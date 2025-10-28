import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Avatar,
  Space,
  Pagination,
  Dropdown,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  FileTextOutlined,
  EyeOutlined,
  WarningFilled,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface JobDataType {
  key: string;
  status: 'draft' | 'active' | 'expired';
  title: string;
  duration: string;
  dates: string;
  isExpiring: boolean;
  member: string;
  applications: number;
  views: number;
  display: string;
}

const mockData: JobDataType[] = [
  {
    key: '1',
    status: 'draft',
    title: 'Nhân viên bán gà rán',
    duration: '60 ngày',
    dates: '26 thg 10 2025 - 26 thg 12 2025',
    isExpiring: true,
    member: 'user_avatar_id_1',
    applications: 0,
    views: 0,
    display: 'Bình thường',
  },
];

const columns: TableColumnsType<JobDataType> = [
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: 'draft' | 'active') => (
      <>
        {status === 'draft' && <Tag color="grey">BẢN TẠM</Tag>}
        {status === 'active' && <Tag color="green">ĐANG ĐĂNG</Tag>}
      </>
    ),
  },
  {
    title: 'Công việc',
    dataIndex: 'title',
    key: 'title',
    render: (text, record) => (
      <div>
        <a href="#" className="font-semibold text-blue-600 hover:underline">
          {text}
        </a>
        <div className="text-xs text-gray-500">
          {record.duration} | {record.dates}
        </div>
        {record.isExpiring && (
          <div className="text-xs text-yellow-500 flex items-center mt-1">
            <WarningFilled className="mr-1" />
            Sắp hết hạn trong 30 ngày
          </div>
        )}
      </div>
    ),
  },
  {
    title: 'Thành viên',
    dataIndex: 'member',
    key: 'member',
    render: () => <Avatar icon={<UserOutlined />} />,
  },
  {
    title: 'Đơn ứng tuyển',
    dataIndex: 'applications',
    key: 'applications',
    render: (count) => (
      <Space>
        <FileTextOutlined /> {count}
      </Space>
    ),
  },
  {
    title: 'Lượt xem',
    dataIndex: 'views',
    key: 'views',
    render: (count) => (
      <Space>
        <EyeOutlined /> {count}
      </Space>
    ),
  },
  {
    title: 'Cách hiển thị',
    dataIndex: 'display',
    key: 'display',
  },
  {
    title: 'Làm mới',
    key: 'refresh',
    render: () => (
      <Button type="link" size="small">
        Làm mới
      </Button>
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    render: () => (
      <Space size="middle">
        <Button type="link" size="small" className="!px-0">
          Sửa
        </Button>
        <Dropdown
          menu={{
            items: [
              { key: '1', label: 'Xem chi tiết' },
              { key: '2', label: 'Tạm dừng' },
              { key: '3', label: 'Xóa', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      </Space>
    ),
  },
];

const TopPagination: React.FC = () => (
  <div className="flex justify-between items-center">
    <Pagination
      simple
      defaultCurrent={1}
      total={10}
      prevIcon={<LeftOutlined />}
      nextIcon={<RightOutlined />}
    />
    <Space>
      <span className="text-sm text-gray-600">Hiển thị:</span>
      <Select defaultValue="25 Hàng" size="small">
        <Option value="25 Hàng">25 Hàng</Option>
        <Option value="50 Hàng">50 Hàng</Option>
        <Option value="100 Hàng">100 Hàng</Option>
      </Select>
    </Space>
  </div>
);

const EmployerJobsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Công việc của tôi (1)
        </h1>
        <NavLink to="/nha-tuyen-dung/dang-tin">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Đăng công việc mới
          </Button>
        </NavLink>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        
        <div className="flex justify-between items-center">
          <Space wrap>
            <Input
              placeholder="Tìm công việc"
              prefix={<SearchOutlined />}
              className="w-48"
            />
            <Select defaultValue="all" className="w-40">
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="draft">Bản tạm</Option>
              <Option value="active">Đang đăng</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
            <Select placeholder="Ngành nghề" className="w-40" allowClear>
            </Select>
            <Select placeholder="Nơi làm việc" className="w-40" allowClear>
            </Select>
          </Space>
          <Button icon={<DownloadOutlined />} type="link">
            Xuất báo cáo
          </Button>
        </div>

        <TopPagination />

        <Table
          columns={columns}
          dataSource={mockData}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
          }}
        />

        <TopPagination />
      </div>
    </div>
  );
};

export default EmployerJobsPage;